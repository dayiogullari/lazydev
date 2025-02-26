use cosmwasm_schema::cw_serde;
use cosmwasm_std::{
    ensure, entry_point, to_json_binary, wasm_execute, Addr, Binary, Deps, DepsMut, Env,
    MessageInfo, Response, StdResult, SubMsg, WasmMsg,
};
use sha2::{Digest, Sha256};

use crate::{
    error::Error,
    models::{
        github::{CollaboratorPermissionsBody, PrBody},
        reclaim::{JsonExtractedParameters, Proof, UserExtractedParameters},
    },
    msg::{
        CommitAccountMsg, CommitRepoMsg, ExecuteMsg, InstantiateMsg, LinkAccountMsg, LinkRepoMsg,
        MigrateMsg, PrEligibility, QueryMsg, RewardExecuteMsg, RewardMsg, VerifierMsg,
        VerifyProofMsg,
    },
    state::{
        Config, Repo, RepoCommitment, UserCommitment, CONFIG, EXISTING_PROOFS, REPOS,
        REPO_COMMITMENTS, REWARDED_PRS, USERS, USER_COMMITMENTS,
    },
};

pub const SERIALIZATION_INFALLIBLE_MSG: &str = "serialization is infallible";
pub const STORAGE_ACCESS_INFALLIBLE_MSG: &str = "storage access is infallible";

pub const REWARD_CALLBACK_REPLY_ID: u64 = 1;

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
                // let rewards = repo_config
                //     .label_configs
                //     .iter()
                //     .map(|label_config| deps.querier.query_wasm_smart(label_config));

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
pub fn execute(
    mut deps: DepsMut,
    env: Env,
    _info: MessageInfo,
    msg: ExecuteMsg,
) -> Result<Response, Error> {
    let config = CONFIG.load(deps.storage).expect("config must exist");

    match msg {
        ExecuteMsg::LinkAccount(msg) => link_account(&mut deps, &env, msg, &config),
        ExecuteMsg::CommitAccount(msg) => commit_account(&mut deps, &env, msg, &config),

        ExecuteMsg::CommitRepo(msg) => commit_repo(&mut deps, &env, msg, &config),
        ExecuteMsg::LinkRepo(msg) => link_repo(&mut deps, &env, msg, &config),

        ExecuteMsg::RewardPr(msg) => {
            let context = msg.proof.deserialize_context::<JsonExtractedParameters>()?;

            let body = serde_json_wasm::from_str::<PrBody>(&context.extracted_parameters.json)
                .map_err(Error::InvalidExtractedParameters)?;

            let url = msg.proof.deserialize_parameters()?.url;

            let (org, repo, pr_id) = parse_github_api_url(&url).ok_or(Error::InvalidPrUrl)?;

            // sanity check
            assert_eq!(body.number, pr_id);

            let recipient_address = USERS
                .load(deps.storage, body.user.id)
                .expect(STORAGE_ACCESS_INFALLIBLE_MSG);

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

                            let payload =
                                to_json_binary(&callback).expect(SERIALIZATION_INFALLIBLE_MSG);

                            SubMsg::reply_on_success(
                                wasm_execute(
                                    label_config.reward_contract.clone(),
                                    &RewardExecuteMsg::Reward(callback),
                                    vec![],
                                )
                                .expect(SERIALIZATION_INFALLIBLE_MSG),
                                REWARD_CALLBACK_REPLY_ID,
                            )
                            .with_payload(payload)
                        })
                })))
        }
    }
}

#[cfg_attr(not(feature = "library"), entry_point)]
#[allow(clippy::needless_pass_by_value)]
pub fn migrate(_: DepsMut, _: Env, _: MigrateMsg) -> StdResult<Response> {
    Ok(Response::default())
}

fn commit_account(
    deps: &mut DepsMut,
    env: &Env,
    msg: CommitAccountMsg,
    config: &Config,
) -> Result<Response, Error> {
    if let Some(commitment) = USER_COMMITMENTS
        .may_load(
            deps.storage,
            (msg.commitment_key.to_vec(), msg.github_user_id),
        )
        .expect(STORAGE_ACCESS_INFALLIBLE_MSG)
    {
        if env.block.height - commitment.commitment_height >= config.commitment_delay_max_height {
            // ok
        } else {
            return Err(Error::CommitmentAlreadyExists(msg.commitment_key));
        }
    }

    ensure!(
        msg.commitment_key.len() == 32,
        Error::InvalidCommitmentLength(msg.commitment_key.len())
    );

    USER_COMMITMENTS
        .save(
            deps.storage,
            (msg.commitment_key.to_vec(), msg.github_user_id),
            &UserCommitment {
                github_user_id: msg.github_user_id,
                commitment_height: env.block.height,
                recipient_address: msg.recipient_address,
            },
        )
        .expect(STORAGE_ACCESS_INFALLIBLE_MSG);

    Ok(Response::new())
}

fn link_account(
    deps: &mut DepsMut,
    env: &Env,
    msg: LinkAccountMsg,
    config: &Config,
) -> Result<Response, Error> {
    let proof_hash =
        sha256(&serde_json_wasm::to_vec(&msg.proof).expect(SERIALIZATION_INFALLIBLE_MSG));

    // check if this proof has been committed already
    if EXISTING_PROOFS.has(deps.storage, proof_hash.clone()) {
        return Err(Error::ProofAlreadySubmitted);
    }

    let context = msg.proof.deserialize_context::<UserExtractedParameters>()?;

    let github_user_id: u64 = context
        .extracted_parameters
        .id
        .parse()
        .map_err(|_| Error::InvalidUserId)?;

    let commitment_key = sha256(msg.secret.as_slice());

    let commitment = USER_COMMITMENTS
        .may_load(deps.storage, (commitment_key.clone(), github_user_id))
        .expect(STORAGE_ACCESS_INFALLIBLE_MSG)
        .ok_or(Error::CommitmentKeyNotFound(commitment_key.clone().into()))?;

    ensure!(
        (config.commitment_delay_min_height..config.commitment_delay_max_height)
            .contains(&(env.block.height - commitment.commitment_height)),
        Error::CommitmentExpired
    );

    ensure!(
        commitment.github_user_id == github_user_id,
        Error::InvalidCommitmentUserId
    );

    USER_COMMITMENTS.remove(deps.storage, (commitment_key, commitment.github_user_id));
    EXISTING_PROOFS
        .save(deps.storage, proof_hash.clone(), &())
        .expect(STORAGE_ACCESS_INFALLIBLE_MSG);
    USERS
        .save(
            deps.storage,
            commitment.github_user_id,
            &msg.recipient_address,
        )
        .expect(STORAGE_ACCESS_INFALLIBLE_MSG);

    Ok(Response::new().add_submessage(verify_proof_sub_msg(&config.verifier_address, msg.proof)))
}

fn sha256(secret: &[u8]) -> Vec<u8> {
    Sha256::new().chain_update(secret).finalize().to_vec()
}

fn link_repo(
    deps: &mut DepsMut,
    env: &Env,
    msg: LinkRepoMsg,
    config: &Config,
) -> Result<Response, Error> {
    // TODO: DO FOR BOTH PROOFS
    let proof_hash = sha256(
        &serde_json_wasm::to_vec(&msg.repo_admin_permissions_proof)
            .expect(SERIALIZATION_INFALLIBLE_MSG),
    );

    // check if this proof has been committed already
    if EXISTING_PROOFS.has(deps.storage, proof_hash.clone()) {
        return Err(Error::ProofAlreadySubmitted);
    }

    EXISTING_PROOFS
        .save(deps.storage, proof_hash.clone(), &())
        .expect(STORAGE_ACCESS_INFALLIBLE_MSG);

    let admin_github_user_id: u64 = msg
        .repo_admin_user_proof
        .deserialize_context::<UserExtractedParameters>()?
        .extracted_parameters
        .id
        .parse()
        .map_err(|_| Error::InvalidUserId)?;

    let admin_permissions_body = msg
        .repo_admin_permissions_proof
        .deserialize_context::<JsonExtractedParameters>()?
        .extracted_parameters
        .deserialize_json::<CollaboratorPermissionsBody>()?;

    ensure!(
        admin_permissions_body.permission == "admin",
        Error::InvalidUserPermission
    );

    ensure!(
        admin_permissions_body.user.id == admin_github_user_id,
        Error::UserProofNotForRepoAdmin
    );

    let commitment_key = sha256(msg.secret.as_slice());

    let commitment = REPO_COMMITMENTS
        .may_load(deps.storage, commitment_key.clone())
        .expect(STORAGE_ACCESS_INFALLIBLE_MSG)
        .ok_or(Error::CommitmentKeyNotFound(commitment_key.clone().into()))?;

    ensure!(
        (config.commitment_delay_min_height..config.commitment_delay_max_height)
            .contains(&(env.block.height - commitment.commitment_height)),
        Error::CommitmentExpired
    );

    // ensure that the originally committed repo and config are the same as the values provided in
    // the link message
    ensure!(
        commitment.repo == msg.repo && commitment.config == msg.config,
        Error::InvalidRepoCommitment
    );

    // remove commitment now that the repo has been linked
    REPO_COMMITMENTS.remove(deps.storage, commitment_key);

    REPOS
        .save(deps.storage, (msg.repo.org, msg.repo.repo), &msg.config)
        .expect(STORAGE_ACCESS_INFALLIBLE_MSG);

    // verify both the user admin proof and the user admin permissions proof
    Ok(Response::new().add_submessages([
        verify_proof_sub_msg(&config.verifier_address, msg.repo_admin_user_proof),
        verify_proof_sub_msg(&config.verifier_address, msg.repo_admin_permissions_proof),
    ]))
}

fn commit_repo(
    deps: &mut DepsMut,
    env: &Env,
    msg: CommitRepoMsg,
    config: &Config,
) -> Result<Response, Error> {
    if let Some(commitment) = REPO_COMMITMENTS
        .may_load(deps.storage, msg.commitment_key.to_vec())
        .expect(STORAGE_ACCESS_INFALLIBLE_MSG)
    {
        if env.block.height - commitment.commitment_height >= config.commitment_delay_max_height {
            // ok
        } else {
            return Err(Error::CommitmentAlreadyExists(msg.commitment_key));
        }
    }

    ensure!(
        msg.commitment_key.len() == 32,
        Error::InvalidCommitmentLength(msg.commitment_key.len())
    );

    REPO_COMMITMENTS
        .save(
            deps.storage,
            msg.commitment_key.to_vec(),
            &RepoCommitment {
                repo: msg.repo,
                config: msg.config,
                commitment_height: env.block.height,
            },
        )
        .expect(STORAGE_ACCESS_INFALLIBLE_MSG);

    Ok(Response::new())
}

#[cw_serde]
pub struct UserPayload {
    pub github_user_id: u64,
    pub recipient_addr: Addr,
    pub commitment_key: Binary,
    pub proof_hash: Binary,
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

fn parse_github_api_url(url: &str) -> Option<(&str, &str, u64)> {
    let ("", tail) = url.split_once("https://api.github.com/repos/")? else {
        return None;
    };
    let (org, tail) = tail.split_once('/')?;
    let (repo, id) = tail.split_once("/pulls/")?;

    Some((org, repo, id.parse().ok()?))
}

#[test]
fn test_parse_github_api_url() {
    let url = "https://api.github.com/repos/benluelo/test/pulls/1";

    assert_eq!(parse_github_api_url(url).unwrap(), ("benluelo", "test", 1));
}

// #[cfg_attr(not(feature = "library"), entry_point)]
// pub fn reply(deps: DepsMut, _env: Env, reply: Reply) -> Result<Response, Error> {
//     // REWARD USER

//     let payload = serde_json_wasm::from_slice::<RewardMsg>(&reply.payload)
//         .expect(SERIALIZATION_INFALLIBLE_MSG);

//     REWARDED_PRS
//         .update(
//             deps.storage,
//             (payload.repo.org, payload.repo.repo, payload.pr_id),
//             |t| {
//                 let t = t.unwrap_or_default();
//                 t.push(reply.result.unwrap());
//             },
//         )
//         .expect(STORAGE_ACCESS_INFALLIBLE_MSG);

//     Ok(Response::default())
// }
