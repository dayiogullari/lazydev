use cosmwasm_schema::cw_serde;
use cosmwasm_std::Uint128;

#[cw_serde]
pub enum PrReward {
    Token {
        /// The denom of the token for this reward. If this is a native token, it will be the
        /// denom, otherwise if this is a cw20 token, this will be the contract address of the
        /// token.
        denom: String,
        amount: Uint128,
    },
    // TODO: Add NFT reward type
    Nft {
        symbol: String,
        id: u64,
    },
}
