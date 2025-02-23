use cosmwasm_std::{
    ensure, entry_point, to_json_binary, to_json_string, wasm_execute, Addr, Binary, Deps, DepsMut,
    Env, Event, MessageInfo, Response, StdResult, SubMsg, WasmMsg,
};
use cw_storage_plus::{Map, PrimaryKey};
use serde::{de::DeserializeOwned, Serialize};

use crate::{
    error::Error,
    models::{
        github::{CollaboratorPermissionsBody, PrBody},
        reclaim::{JsonExtractedParameters, Proof, UserExtractedParameters},
    },
    msg::{
        ExecuteMsg, InstantiateMsg, LinkAccountMsg, LinkRepoMsg, MigrateMsg, PrEligibility,
        QueryMsg, RewardExecuteMsg, RewardMsg, RewardPrMsg, VerifierMsg, VerifyProofMsg,
    },
    state::{
        Commitment, Config, Repo, CONFIG, EXISTING_PROOFS, REPOS, REPO_COMMITMENTS, REWARDED_PRS,
        USERS, USER_COMMITMENTS,
    },
    utils::{parse_github_api_repos_contributors_url, parse_github_api_repos_url, sha256},
};

pub const SERIALIZATION_INFALLIBLE_MSG: &str = "serialization is infallible";
pub const STORAGE_ACCESS_INFALLIBLE_MSG: &str = "storage access is infallible";

pub const ADMIN_PERMISSION: &str = "admin";

#[cfg_attr(not(feature = "library"), entry_point)]
#[allow(clippy::needless_pass_by_value)]
pub fn instantiate(
    deps: DepsMut,
    _env: Env,
    _info: MessageInfo,
    msg: InstantiateMsg,
) -> StdResult<Response> {
    assert!(msg.commitment_delay_min_height < msg.commitment_delay_max_height);

    let state = Config {
        // repo: msg.repo,
        verifier_address: msg.verifier_address,
        commitment_delay_min_height: msg.commitment_delay_min_height,
        commitment_delay_max_height: msg.commitment_delay_max_height,
    };

    CONFIG.save(deps.storage, &state)?;

    Ok(Response::default())
}

#[cfg_attr(not(feature = "library"), entry_point)]
#[allow(clippy::needless_pass_by_value)]
pub fn query(deps: Deps, _env: Env, msg: QueryMsg) -> StdResult<Binary> {
    match msg {
        QueryMsg::LinkedAddress { github_user_id } => Ok(to_json_binary(
            &USERS.may_load(deps.storage, github_user_id)?,
        )?),
        QueryMsg::Repos {} => Ok(to_json_binary(
            &REPOS
                .range(deps.storage, None, None, cosmwasm_std::Order::Ascending)
                .collect::<Result<Vec<_>, _>>()?
                .into_iter()
                .map(|((org, repo), _)| Repo { org, repo })
                .collect::<Vec<_>>(),
        )?),
        QueryMsg::RepoConfig { repo } => Ok(to_json_binary(
            &REPOS.may_load(deps.storage, (repo.org, repo.repo))?,
        )?),
        QueryMsg::QueryPrEligibility {
            repo,
            pr_id,
            github_user_id,
        } => {
            let eligibility = if !USERS.has(deps.storage, github_user_id) {
                // if the user has not yet linked, the pr is not eligible
                PrEligibility::Ineligible
            } else if REPOS.has(deps.storage, (repo.org.clone(), repo.repo.clone())) {
                if REWARDED_PRS.has(deps.storage, (repo.org, repo.repo, pr_id)) {
                    PrEligibility::Claimed
                } else {
                    PrEligibility::Eligible
                }
            } else {
                // if the repo has not been linked, the pr is not eligible
                PrEligibility::Ineligible
            };

            Ok(to_json_binary(&eligibility)?)
        }
    }
}

#[cfg_attr(not(feature = "library"), entry_point)]
#[allow(clippy::needless_pass_by_value)]
pub fn migrate(_: DepsMut, _: Env, _: MigrateMsg) -> StdResult<Response> {
    Ok(Response::default())
}

#[cfg_attr(not(feature = "library"), entry_point)]
#[allow(clippy::needless_pass_by_value)]
pub fn execute(
    mut deps: DepsMut,
    env: Env,
    _info: MessageInfo,
    msg: ExecuteMsg,
) -> Result<Response, Error> {
    let config = CONFIG.load(deps.storage).expect("config must exist");

    match msg {
        ExecuteMsg::CommitRepo(msg) => commit(
            &mut deps,
            &env,
            msg.repo,
            msg.config,
            msg.commitment_key,
            &REPO_COMMITMENTS,
            &config,
        ),
        ExecuteMsg::LinkRepo(msg) => link_repo(&mut deps, &env, msg, &config),

        ExecuteMsg::CommitAccount(msg) => commit(
            &mut deps,
            &env,
            msg.github_user_id,
            msg.recipient_address,
            msg.commitment_key,
            &USER_COMMITMENTS,
            &config,
        ),
        ExecuteMsg::LinkAccount(msg) => link_account(&mut deps, &env, msg, &config),

        ExecuteMsg::RewardPr(msg) => reward_pr(&mut deps, msg, &config),
    }
}

#[allow(clippy::needless_pass_by_value)] // leave me alone man
fn commit<'a, Key: PrimaryKey<'a>, Value: Clone + Serialize + DeserializeOwned>(
    deps: &mut DepsMut,
    env: &Env,
    key: Key,
    value: Value,
    commitment_key: Binary,
    store: &Map<Key, Commitment<Value>>,
    config: &Config,
) -> Result<Response, Error> {
    if let Some(commitment) = store
        .may_load(deps.storage, key.clone())
        .expect(STORAGE_ACCESS_INFALLIBLE_MSG)
    {
        if env.block.height - commitment.commitment_height >= config.commitment_delay_max_height {
            // ok, expired
        } else {
            return Err(Error::CommitmentAlreadyExists(commitment_key));
        }
    }

    ensure!(
        commitment_key.len() == 32,
        Error::InvalidCommitmentLength(commitment_key.len())
    );

    store
        .save(
            deps.storage,
            key,
            &Commitment {
                commitment_key,
                commitment_height: env.block.height,
                value: value.clone(),
            },
        )
        .expect(STORAGE_ACCESS_INFALLIBLE_MSG);

    Ok(
        Response::new().add_event(Event::new("commit").add_attribute(
            std::str::from_utf8(store.namespace_bytes()).expect("valid utf8; qed;"),
            to_json_string(&value).expect(SERIALIZATION_INFALLIBLE_MSG),
        )),
    )
}

fn link_repo(
    deps: &mut DepsMut,
    env: &Env,
    msg: LinkRepoMsg,
    config: &Config,
) -> Result<Response, Error> {
    ensure_new_proof(deps, &msg.repo_admin_permissions_proof)?;
    ensure_new_proof(deps, &msg.repo_admin_user_proof)?;

    let admin_github_user_id = msg
        .repo_admin_user_proof
        .deserialize_context::<UserExtractedParameters>()?
        .extracted_parameters
        .id
        .parse::<u64>()
        .map_err(|_| Error::InvalidUserId)?;

    let admin_permissions_body = msg
        .repo_admin_permissions_proof
        .deserialize_context::<JsonExtractedParameters>()?
        .extracted_parameters
        .deserialize_json::<CollaboratorPermissionsBody>()?;

    ensure!(
        admin_permissions_body.permission == ADMIN_PERMISSION,
        Error::InvalidUserPermission
    );

    ensure!(
        admin_permissions_body.user.id == admin_github_user_id,
        Error::UserProofNotForRepoAdmin
    );

    let parameters = msg.repo_admin_permissions_proof.deserialize_parameters()?;
    let (org, repo, _) = parse_github_api_repos_contributors_url(&parameters.url)
        .ok_or(Error::InvalidCollaboratorUrl)?;

    let commitment_key = sha256(msg.secret.as_slice());

    let commitment = REPO_COMMITMENTS
        .may_load(
            deps.storage,
            Repo {
                org: org.to_owned(),
                repo: repo.to_owned(),
            },
        )
        .expect(STORAGE_ACCESS_INFALLIBLE_MSG)
        .ok_or(Error::UserCommitmentNotFound(
            admin_permissions_body.user.id,
        ))?;

    ensure!(
        (config.commitment_delay_min_height..config.commitment_delay_max_height)
            .contains(&(env.block.height - commitment.commitment_height)),
        Error::CommitmentExpired
    );

    // ensure that the originally committed repo and config are the same as the values provided in
    // the link message
    ensure!(
        commitment_key == commitment.commitment_key && commitment.value == msg.config,
        Error::InvalidCommitment
    );

    // remove commitment now that the repo has been linked
    REPO_COMMITMENTS.remove(
        deps.storage,
        Repo {
            org: org.to_owned(),
            repo: repo.to_owned(),
        },
    );

    REPOS
        .save(deps.storage, (msg.repo.org, msg.repo.repo), &msg.config)
        .expect(STORAGE_ACCESS_INFALLIBLE_MSG);

    // verify both the user admin proof and the user admin permissions proof
    Ok(Response::new()
        .add_submessages([
            verify_proof_sub_msg(&config.verifier_address, msg.repo_admin_user_proof),
            verify_proof_sub_msg(&config.verifier_address, msg.repo_admin_permissions_proof),
        ])
        .add_event(Event::new("link_repo").add_attribute("repo", format!("{org}/{repo}"))))
}

fn link_account(
    deps: &mut DepsMut,
    env: &Env,
    msg: LinkAccountMsg,
    config: &Config,
) -> Result<Response, Error> {
    ensure_new_proof(deps, &msg.proof)?;

    let context = msg.proof.deserialize_context::<UserExtractedParameters>()?;

    let github_user_id = context
        .extracted_parameters
        .id
        .parse::<u64>()
        .map_err(|_| Error::InvalidUserId)?;

    let commitment_key = sha256(msg.secret);

    let commitment = USER_COMMITMENTS
        .may_load(deps.storage, github_user_id)
        .expect(STORAGE_ACCESS_INFALLIBLE_MSG)
        .ok_or(Error::UserCommitmentNotFound(github_user_id))?;

    ensure!(
        (config.commitment_delay_min_height..config.commitment_delay_max_height)
            .contains(&(env.block.height - commitment.commitment_height)),
        Error::CommitmentExpired
    );

    ensure!(
        commitment.commitment_key == commitment_key,
        Error::InvalidCommitmentKey
    );

    USER_COMMITMENTS.remove(deps.storage, github_user_id);
    USERS
        .save(deps.storage, github_user_id, &msg.recipient_address)
        .expect(STORAGE_ACCESS_INFALLIBLE_MSG);

    Ok(Response::new().add_submessage(verify_proof_sub_msg(&config.verifier_address, msg.proof)))
}

fn reward_pr(deps: &mut DepsMut, msg: RewardPrMsg, config: &Config) -> Result<Response, Error> {
    let context = msg.proof.deserialize_context::<JsonExtractedParameters>()?;

    let body = serde_json_wasm::from_str::<PrBody>(&context.extracted_parameters.json)
        .map_err(Error::InvalidExtractedParameters)?;

    let url = msg.proof.deserialize_parameters()?.url;

    let (org, repo, pr_id) = parse_github_api_repos_url(&url).ok_or(Error::InvalidPrUrl)?;

    // sanity check
    assert_eq!(body.number, pr_id);

    let recipient_address = USERS
        .may_load(deps.storage, body.user.id)
        .expect(STORAGE_ACCESS_INFALLIBLE_MSG)
        .ok_or(Error::UserNotFound(body.user.id))?;

    ensure!(
        url == format!(
            "https://api.github.com/repos/{}/{}/pulls/{}",
            org, repo, body.number
        ),
        Error::InvalidRepo
    );

    ensure!(body.merged, Error::PrNotMerged);

    ensure!(
        REWARDED_PRS
            .may_load(deps.storage, (org.to_owned(), repo.to_owned(), body.number))
            .expect(STORAGE_ACCESS_INFALLIBLE_MSG)
            .is_none(),
        Error::PrAlreadyRewarded(body.number)
    );

    REWARDED_PRS
        .save(
            deps.storage,
            (org.to_owned(), repo.to_owned(), body.number),
            &(),
        )
        .expect(STORAGE_ACCESS_INFALLIBLE_MSG);

    let repo_config = REPOS
        .load(deps.storage, (org.to_owned(), repo.to_owned()))
        .expect(STORAGE_ACCESS_INFALLIBLE_MSG);

    Ok(Response::new()
        .add_submessage(verify_proof_sub_msg(&config.verifier_address, msg.proof))
        .add_submessages(body.labels.into_iter().flat_map(|label| {
            repo_config
                .label_configs
                .iter()
                .filter(move |label_config| label_config.label_id == label.id)
                .map(|label_config| {
                    let callback = RewardMsg {
                        repo: Repo {
                            org: org.to_owned(),
                            repo: repo.to_owned(),
                        },
                        pr_id,
                        user_id: body.user.id,
                        recipient_address: recipient_address.clone(),
                        reward_config: label_config.reward_config.clone(),
                    };

                    SubMsg::reply_never(
                        wasm_execute(
                            label_config.reward_contract.clone(),
                            &RewardExecuteMsg::Reward(callback),
                            vec![],
                        )
                        .expect(SERIALIZATION_INFALLIBLE_MSG),
                    )
                })
        })))
}

#[must_use]
pub fn verify_proof_sub_msg(contract: &Addr, proof: Proof) -> SubMsg {
    SubMsg::reply_never(WasmMsg::Execute {
        contract_addr: contract.to_string(),
        msg: to_json_binary(&VerifierMsg::VerifyProof(VerifyProofMsg { proof }))
            .expect(SERIALIZATION_INFALLIBLE_MSG),
        funds: vec![],
    })
}

/// Ensures that the proof has not been used yet, and saves the checksum of it if it is new.
fn ensure_new_proof(deps: &mut DepsMut, proof: &Proof) -> Result<(), Error> {
    let proof_hash = sha256(serde_json_wasm::to_vec(&proof).expect(SERIALIZATION_INFALLIBLE_MSG));

    if EXISTING_PROOFS.has(deps.storage, proof_hash.clone()) {
        return Err(Error::ProofAlreadySubmitted);
    }

    EXISTING_PROOFS
        .save(deps.storage, proof_hash.clone(), &())
        .expect(SERIALIZATION_INFALLIBLE_MSG);

    Ok(())
}
