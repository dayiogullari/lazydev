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
    pub collection_name: String,
    /// The symbol of the cw20 token. This will be forwarded to the cw20-base instantiation.
    pub symbol: String,
    /// The repos this contract will provide rewards for.
    pub valid_repos: Vec<Repo>,
    /// The orgs this contract will provide rewards for.
    pub valid_orgs: Vec<String>,
    /// The code id of the cw20 base code to instantiate the token with.
    pub cw721_base_code_id: u64,
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

/// We use cosmwasm-std 2, but cw721 is still using 1.x, causing issues with duplicate symbols at
/// build time. As such, we redefine the minimal interface we use for interacting with the cw721
/// contract here.
pub mod cw721 {
    use cosmwasm_schema::cw_serde;

    #[cw_serde]
    pub struct InstantiateMsg {
        /// Name of the NFT contract
        pub name: String,
        /// Symbol of the NFT contract
        pub symbol: String,

        /// The minter is the only one who can create new NFTs.
        /// This is designed for a base NFT that is controlled by an external program
        /// or contract. You will likely replace this with custom logic in custom NFTs
        pub minter: String,
    }

    #[cw_serde]
    pub enum ExecuteMsg {
        /// Mint a new NFT, can only be called by the contract minter
        Mint {
            /// Unique ID of the NFT
            token_id: String,
            /// The owner of the newly minter NFT
            owner: String,
            /// Universal resource identifier for this NFT
            /// Should point to a JSON file that conforms to the ERC721
            /// Metadata JSON Schema
            token_uri: Option<String>,
        },
    }
}
