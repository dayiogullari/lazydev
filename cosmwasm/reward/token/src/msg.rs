use cosmwasm_schema::{cw_serde, QueryResponses};
use cosmwasm_std::Addr;
use lazydev::msg::{QueryRewardsResponse, RewardMsg};

#[cw_serde]
pub struct InstantiateMsg {
    pub config: Config,
    pub lazydev_address: Addr,
}

#[cw_serde]
pub struct Config {
    pub name: String,
    pub symbol: String,
    pub decimals: u8,
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
