use cosmwasm_schema::{cw_serde, QueryResponses};
use cosmwasm_std::Addr;
use lazydev::{
    msg::{QueryRewardsResponse, RewardMsg},
    state::Repo,
};

#[cw_serde]
pub struct InstantiateMsg {
    pub config: Config,
    pub lazydev_address: Addr,
}

#[cw_serde]
pub struct Config {
    /// The name of the cw20 token. This will be forwarded to the cw20-base instantiation.
    pub name: String,
    /// The symbol of the cw20 token. This will be forwarded to the cw20-base instantiation.
    pub symbol: String,
    /// The decimals of the cw20 token. This will be forwarded to the cw20-base instantiation.
    pub decimals: u8,

    /// The repos this contract will provide rewards for.
    pub valid_repos: Vec<Repo>,
    /// The orgs this contract will provide rewards for.
    pub valid_orgs: Vec<String>,

    /// The code id of the cw20 base code to instantiate the token with.
    pub cw20_base_code_id: u64,
}

#[cw_serde]
pub enum ExecuteMsg {
    Reward(RewardMsg),
}

#[cw_serde]
#[derive(QueryResponses)]
pub enum QueryMsg {
    #[returns(QueryRewardsResponse)]
    Rewards(RewardMsg),
}

#[cw_serde]
pub struct MigrateMsg {}
