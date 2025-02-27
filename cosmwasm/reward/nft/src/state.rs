use cosmwasm_std::Addr;
use cw_storage_plus::{Item, Map};
use lazydev::{models::reward::PrReward, state::Repo};

pub const ADMIN: Item<Addr> = Item::new("admin");

/// The address of the lazydev contract. Only this contract can call the
/// `reward` entrypoint.
pub const LAZYDEV_ADDR: Item<Addr> = Item::new("lazydev");

/// The address of the cw721 contract to mint tokens from.
pub const CW721_ADDR: Item<Addr> = Item::new("token");
pub const SYMBOL: Item<String> = Item::new("symbol");
pub const LAST_NFT_ID: Item<u64> = Item::new("last_nft_id");
pub const ALLOWED_ORGS: Item<Vec<String>> = Item::new("allowed_orgs");

pub const ALLOWED_REPOS: Item<Vec<Repo>> = Item::new("allowed_repos");

/// Already claimed rewards, keyed by a tuple of `(pr_id, org, repo)`.
pub const CLAIMED_REWARDS: Map<(u64, Repo), PrReward> = Map::new("claimed_rewards");
