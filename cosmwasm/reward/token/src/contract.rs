use cosmwasm_std::{
    ensure, entry_point, instantiate2_address, to_json_binary, wasm_execute, Binary, Checksum,
    CodeInfoResponse, Deps, DepsMut, Env, MessageInfo, QueryRequest, Response, StdResult, SubMsg,
    Uint128, WasmMsg,
};
use lazydev::{
    contract::STORAGE_ACCESS_INFALLIBLE_MSG,
    models::reward::PrReward,
    msg::{QueryRewardsResponse, RewardMsg},
    reward_event,
};
use sha2::{Digest, Sha256};

use crate::{
    error::Error,
    msg::{ExecuteMsg, InstantiateMsg, MigrateMsg, QueryMsg},
    state::{ADMIN, ALLOWED_ORGS, ALLOWED_REPOS, CLAIMED_REWARDS, LAZYDEV_ADDR, TOKEN_ADDR},
};

#[entry_point]
#[allow(clippy::needless_pass_by_value)]
pub fn instantiate(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: InstantiateMsg,
) -> StdResult<Response> {
    ADMIN
        .save(deps.storage, &info.sender)
        .expect(STORAGE_ACCESS_INFALLIBLE_MSG);

    LAZYDEV_ADDR
        .save(deps.storage, &msg.lazydev_address)
        .expect(STORAGE_ACCESS_INFALLIBLE_MSG);

    ALLOWED_REPOS
        .save(deps.storage, &msg.config.valid_repos)
        .expect(STORAGE_ACCESS_INFALLIBLE_MSG);

    ALLOWED_ORGS
        .save(deps.storage, &msg.config.valid_orgs)
        .expect(STORAGE_ACCESS_INFALLIBLE_MSG);

    let salt = Sha256::new()
        .chain_update(env.contract.address.as_bytes())
        .chain_update([0])
        .chain_update(msg.config.name.as_bytes())
        .chain_update([0])
        .chain_update(msg.config.symbol.as_bytes())
        .chain_update([0])
        .chain_update([msg.config.decimals])
        .finalize();

    let token_addr = instantiate2_address(
        get_code_hash(deps.as_ref(), msg.config.cw20_base_code_id)?.as_slice(),
        &deps.api.addr_canonicalize(env.contract.address.as_str())?,
        &salt,
    )
    .unwrap();

    TOKEN_ADDR
        .save(deps.storage, &deps.api.addr_humanize(&token_addr).unwrap())
        .expect(STORAGE_ACCESS_INFALLIBLE_MSG);

    Ok(Response::default().add_message(WasmMsg::Instantiate2 {
        admin: Some(info.sender.to_string()),
        code_id: msg.config.cw20_base_code_id,
        label: msg.config.name.clone(),
        msg: to_json_binary(&cw20_base::msg::InstantiateMsg {
            name: msg.config.name,
            symbol: msg.config.symbol,
            decimals: msg.config.decimals,
            initial_balances: vec![],
            mint: Some(cw20::MinterResponse {
                minter: env.contract.address.to_string(),
                cap: None,
            }),
            marketing: None,
        })?,
        funds: vec![],
        salt: Binary::new(salt.to_vec()),
    }))
}

fn get_code_hash(deps: Deps, code_id: u64) -> StdResult<Checksum> {
    Ok(deps
        .querier
        .query::<CodeInfoResponse>(&QueryRequest::Wasm(cosmwasm_std::WasmQuery::CodeInfo {
            code_id,
        }))?
        .checksum)
}

#[entry_point]
#[allow(clippy::needless_pass_by_value)]
pub fn query(deps: Deps, _env: Env, msg: QueryMsg) -> StdResult<Binary> {
    match msg {
        QueryMsg::Rewards(RewardMsg {
            repo,
            pr_id,
            user_id: _,
            recipient_address: _,
            reward_config,
        }) => {
            let response = match CLAIMED_REWARDS.may_load(deps.storage, (pr_id, repo))? {
                Some(claimed_rewards) => QueryRewardsResponse {
                    claimed: true,
                    rewards: vec![claimed_rewards],
                },
                None => QueryRewardsResponse {
                    claimed: false,
                    rewards: vec![PrReward::Token {
                        denom: TOKEN_ADDR.load(deps.storage)?.to_string(),
                        amount: reward_config.parse()?,
                    }],
                },
            };

            Ok(to_json_binary(&response)?)
        }
    }
}

#[entry_point]
#[allow(clippy::needless_pass_by_value)]
pub fn execute(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    msg: ExecuteMsg,
) -> Result<Response, Error> {
    match msg {
        ExecuteMsg::Reward(RewardMsg {
            repo,
            pr_id,
            user_id,
            recipient_address,
            reward_config,
        }) => {
            ensure!(
                LAZYDEV_ADDR
                    .load(deps.storage)
                    .expect(STORAGE_ACCESS_INFALLIBLE_MSG)
                    == info.sender,
                Error::OnlyLazydev
            );

            let cw20_token_addr = TOKEN_ADDR
                .load(deps.storage)
                .expect(STORAGE_ACCESS_INFALLIBLE_MSG);

            let reward_amount = reward_config
                .parse::<Uint128>()
                .map_err(Error::InvalidConfig)?;

            ensure!(
                ALLOWED_ORGS
                    .load(deps.storage)
                    .expect(STORAGE_ACCESS_INFALLIBLE_MSG)
                    .contains(&repo.org)
                    || ALLOWED_REPOS
                        .load(deps.storage)
                        .expect(STORAGE_ACCESS_INFALLIBLE_MSG)
                        .contains(&repo),
                Error::InvalidRepo(repo)
            );

            let reward = PrReward::Token {
                denom: cw20_token_addr.to_string(),
                amount: reward_amount,
            };

            CLAIMED_REWARDS
                .save(deps.storage, (pr_id, repo.clone()), &reward)
                .expect(STORAGE_ACCESS_INFALLIBLE_MSG);

            Ok(Response::new()
                .add_submessage(SubMsg::new(
                    wasm_execute(
                        cw20_token_addr,
                        &cw20::Cw20ExecuteMsg::Mint {
                            recipient: recipient_address.to_string(),
                            amount: reward_amount,
                        },
                        vec![],
                    )
                    .expect("works"),
                ))
                .add_event(reward_event(
                    &reward,
                    repo,
                    pr_id,
                    user_id,
                    recipient_address.to_string(),
                )))
        }
    }
}

#[entry_point]
pub fn migrate(_: DepsMut, _: Env, _: MigrateMsg) -> StdResult<Response> {
    Ok(Response::default())
}
