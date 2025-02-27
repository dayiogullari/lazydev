use cosmwasm_schema::cw_serde;
use cosmwasm_std::Addr;
use cw_storage_plus::{Item, Map};
use lazydev::{models::reward::PrReward, state::Repo};

pub const ADMIN: Item<Addr> = Item::new("admin");

/// The symbol and the data of the collection
#[cw_serde]
pub struct CollectionInfo {
    pub symbol: String,
    pub collection_name: String,
}

/// The address of the lazydev contract. Only this contract can call the
/// `reward` entrypoint.
pub const LAZYDEV_ADDR: Item<Addr> = Item::new("lazydev");

/// The address of the cw721 contract to mint tokens from.
pub const CW721_ADDR: Item<Addr> = Item::new("cw721_addr");
pub const COLLECTION_INFO: Item<CollectionInfo> = Item::new("collection_info");

/// The id of the last NFT, used to mint the next NFT
pub const LAST_NFT_ID: Item<u64> = Item::new("last_nft_id");

// The allowed orgs and repos that can use this collection.
pub const ALLOWED_ORGS: Item<Vec<String>> = Item::new("allowed_orgs");
pub const ALLOWED_REPOS: Item<Vec<Repo>> = Item::new("allowed_repos");

/// Already claimed rewards, keyed by a tuple of `(pr_id, org, repo)`.
pub const CLAIMED_REWARDS: Map<(u64, Repo), PrReward> = Map::new("claimed_rewards");
