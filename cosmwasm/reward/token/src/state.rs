use cosmwasm_std::Addr;
use cw_storage_plus::{Item, Map};
use lazydev::models::reward::PrReward;

pub const ADMIN: Item<Addr> = Item::new("admin");

/// The address of the lazydev contract. Only this contract can call the
/// `reward` entrypoint.
pub const LAZYDEV_ADDR: Item<Addr> = Item::new("lazydev");

/// The address of the cw20 contract to mint tokens from.
pub const TOKEN_ADDR: Item<Addr> = Item::new("token");

/// Already claimed rewards, keyed by a tuple of `(pr_id, org, repo)`.
pub const CLAIMED_REWARDS: Map<(u64, String, String), PrReward> = Map::new("claimed_rewards");
