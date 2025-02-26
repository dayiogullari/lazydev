use cosmwasm_schema::cw_serde;
use cosmwasm_std::Addr;
use cw_storage_plus::{Item, Map};

#[cw_serde]
pub struct Config {
    pub verifier_address: Addr,
    pub commitment_delay_min_height: u64,
    pub commitment_delay_max_height: u64,
}

// Define the singleton state as a global constant using Item
pub const CONFIG: Item<Config> = Item::new("config");

// Define the singleton state as a global constant using Item
pub const USERS: Map<u64, Addr> = Map::new("users");

/// Set of already submitted proofs, used to prevent replay attacks.
///
/// sha256(json(proof))
pub const EXISTING_PROOFS: Map<Vec<u8>, ()> = Map::new("existing_proofs");

/// User commitments, keyed by the sha256 of the secret and the github user id.
// TODO: REMOVE USER ID?
pub const USER_COMMITMENTS: Map<(Vec<u8>, u64), UserCommitment> = Map::new("user_commitments");

pub const REPO_COMMITMENTS: Map<Vec<u8>, RepoCommitment> = Map::new("repo_commitments");

/// `(org, repo)`
pub const REPOS: Map<(String, String), RepoConfig> = Map::new("repos");

/// `(org, repo, pr_id)`
pub const REWARDED_PRS: Map<(String, String, u64), ()> = Map::new("rewarded_prs");

#[cw_serde]
pub struct UserCommitment {
    /// The github user id of the user attempting to link their account.
    pub github_user_id: u64,
    /// The intended recipient address.
    pub recipient_address: Addr,
    /// The height that the commitment was stored at.
    pub commitment_height: u64,
}

#[cw_serde]
pub struct RepoCommitment {
    /// The repo being committed.
    pub repo: Repo,
    /// The intended config.
    pub config: RepoConfig,
    /// The height that the commitment was stored at.
    pub commitment_height: u64,
}

#[cw_serde]
pub struct Repo {
    pub org: String,
    pub repo: String,
}

#[cw_serde]
pub struct RepoConfig {
    /// All of the reward configurations for this repo. A single label may have multiple configured
    /// rewards.
    pub label_configs: Vec<LabelConfig>,
}

#[cw_serde]
pub struct LabelConfig {
    /// The id of the github pr label. Any PRs with this label will be rewarded with
    /// `reward_contract` and `reward_config`.
    pub label_id: u64,
    /// The address of the reard contract that will process the
    /// [`RewardMsg`][crate::msg::RewardMsg] callback.
    pub reward_contract: Addr,
    /// Additional configuration that will be passed to the reward contract. This is stringified
    /// json since [`serde_json_wasm`] doesn't support a dynamic `Value`-like object.
    pub reward_config: String,
}
