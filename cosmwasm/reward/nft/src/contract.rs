use cosmwasm_std::{
    ensure, instantiate2_address, to_json_binary, wasm_execute, Binary, Checksum, CodeInfoResponse,
    Deps, DepsMut, Env, MessageInfo, QueryRequest, Response, StdResult, SubMsg, WasmMsg,
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
    state::{
        CollectionInfo, ADMIN, ALLOWED_ORGS, ALLOWED_REPOS, CLAIMED_REWARDS, COLLECTION_INFO,
        CW721_ADDR, LAST_NFT_ID, LAZYDEV_ADDR,
    },
};

#[cosmwasm_std::entry_point]
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

    LAST_NFT_ID
        .save(deps.storage, &1)
        .expect(STORAGE_ACCESS_INFALLIBLE_MSG);

    let collection_info = CollectionInfo {
        symbol: msg.config.symbol.clone(),
        collection_name: msg.config.collection_name.clone(),
    };

    COLLECTION_INFO
        .save(deps.storage, &collection_info)
        .expect(STORAGE_ACCESS_INFALLIBLE_MSG);

    let salt = Sha256::new()
        .chain_update(env.contract.address.as_bytes())
        .chain_update([0])
        .chain_update(msg.config.collection_name.as_bytes())
        .chain_update([0])
        .chain_update(msg.config.symbol.as_bytes())
        .finalize();

    let token_addr = instantiate2_address(
        get_code_hash(deps.as_ref(), msg.config.cw721_base_code_id)?.as_slice(),
        &deps.api.addr_canonicalize(env.contract.address.as_str())?,
        &salt,
    )
    .unwrap();

    CW721_ADDR
        .save(deps.storage, &deps.api.addr_humanize(&token_addr).unwrap())
        .expect(STORAGE_ACCESS_INFALLIBLE_MSG);

    Ok(Response::default().add_message(WasmMsg::Instantiate2 {
        admin: Some(info.sender.to_string()),
        code_id: msg.config.cw721_base_code_id,
        label: msg.config.collection_name.clone(),
        msg: to_json_binary(&crate::msg::cw721::InstantiateMsg {
            name: msg.config.collection_name,
            symbol: msg.config.symbol,
            minter: env.contract.address.to_string(),
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
//TODO: Query all
#[cosmwasm_std::entry_point]
#[allow(clippy::needless_pass_by_value)]
pub fn query(deps: Deps, _env: Env, msg: QueryMsg) -> StdResult<Binary> {
    match msg {
        QueryMsg::Rewards(RewardMsg {
            repo,
            pr_id,
            user_id: _,
            recipient_address: _,
            reward_config: _,
        }) => {
            let response = match CLAIMED_REWARDS.may_load(deps.storage, (pr_id, repo))? {
                Some(claimed_rewards) => QueryRewardsResponse {
                    claimed: true,
                    rewards: vec![claimed_rewards],
                },
                None => {
                    let collection_info = COLLECTION_INFO.load(deps.storage)?;
                    QueryRewardsResponse {
                        claimed: false,
                        rewards: vec![PrReward::Nft {
                            symbol: collection_info.symbol.to_string(),
                            id: LAST_NFT_ID.load(deps.storage)? + 1,
                            collection_name: collection_info.collection_name.to_string(),
                        }],
                    }
                }
            };

            Ok(to_json_binary(&response)?)
        }
    }
}

#[cosmwasm_std::entry_point]
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
            // NOTE: Currently unused
            reward_config: _,
        }) => {
            ensure!(
                LAZYDEV_ADDR
                    .load(deps.storage)
                    .expect(STORAGE_ACCESS_INFALLIBLE_MSG)
                    == info.sender,
                Error::OnlyLazydev
            );

            let cw721_token_address = CW721_ADDR
                .load(deps.storage)
                .expect(STORAGE_ACCESS_INFALLIBLE_MSG);

            ensure!(
                ALLOWED_ORGS
                    .load(deps.storage)
                    .expect(STORAGE_ACCESS_INFALLIBLE_MSG)
                    .contains(&repo.org)
                    || ALLOWED_REPOS
                        .load(deps.storage)
                        .expect(STORAGE_ACCESS_INFALLIBLE_MSG)
                        .contains(&repo),
                Error::OnlyLazydev
            );

            let nft_id = LAST_NFT_ID
                .load(deps.storage)
                .expect(STORAGE_ACCESS_INFALLIBLE_MSG);
            LAST_NFT_ID
                .save(deps.storage, &(nft_id + 1))
                .expect(STORAGE_ACCESS_INFALLIBLE_MSG);

            let collection_info = COLLECTION_INFO
                .load(deps.storage)
                .expect(STORAGE_ACCESS_INFALLIBLE_MSG);

            let reward = PrReward::Nft {
                symbol: collection_info.symbol,
                id: nft_id,
                collection_name: collection_info.collection_name,
            };
            CLAIMED_REWARDS
                .save(deps.storage, (pr_id, repo.clone()), &reward)
                .expect(STORAGE_ACCESS_INFALLIBLE_MSG);

            Ok(Response::new()
                .add_submessage(SubMsg::new(
                    wasm_execute(
                        cw721_token_address,
                        &crate::msg::cw721::ExecuteMsg::Mint {
                            token_id: nft_id.to_string(),
                            owner: recipient_address.to_string(),
                            token_uri: None,
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

#[cosmwasm_std::entry_point]
pub fn migrate(_: DepsMut, _: Env, _: MigrateMsg) -> StdResult<Response> {
    Ok(Response::default())
}
