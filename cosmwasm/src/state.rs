use cosmwasm_schema::cw_serde;
use cosmwasm_std::{Addr, Binary};
use cw_storage_plus::{Item, Key, KeyDeserialize, Map, PrimaryKey};

#[cw_serde]
pub struct Config {
    pub verifier_address: Addr,
    pub commitment_delay_min_height: u64,
    pub commitment_delay_max_height: u64,
}

pub const CONFIG: Item<Config> = Item::new("config");

pub const USERS: Map<u64, Addr> = Map::new("users");

/// Set of already submitted proofs, used to prevent replay attacks.
///
/// sha256(json(proof))
pub const EXISTING_PROOFS: Map<Vec<u8>, ()> = Map::new("existing_proofs");

/// User commitments, keyed by the github user id of the user attempting to link their account.
///
/// The commitment value is the intended recipient address.
pub const USER_COMMITMENTS: Map<u64, Commitment<Addr>> = Map::new("user_commitments");

/// Repo commitments, keyed by the repo being configured.
///
/// The commitment value is the intended repo config.
pub const REPO_COMMITMENTS: Map<Repo, Commitment<RepoConfig>> = Map::new("repo_commitments");

/// `(org, repo)`
pub const REPOS: Map<(String, String), RepoConfig> = Map::new("repos");

/// Pull requests that have already been rewarded.
///
/// `(org, repo, pr_id)`
pub const REWARDED_PRS: Map<(String, String, u64), ()> = Map::new("rewarded_prs");

#[cw_serde]
pub struct Commitment<T> {
    /// The sha256(secret) hash that will be revealed in when submitting the proof.
    pub commitment_key: Binary,
    /// The height that the commitment was stored at.
    pub commitment_height: u64,
    /// The value that will be committed.
    pub value: T,
}

#[cw_serde]
pub struct Repo {
    pub org: String,
    pub repo: String,
}

impl<'a> PrimaryKey<'a> for Repo {
    type Prefix = <(String, String) as PrimaryKey<'a>>::Prefix;

    type SubPrefix = <(String, String) as PrimaryKey<'a>>::SubPrefix;

    type Suffix = <(String, String) as PrimaryKey<'a>>::Suffix;

    type SuperSuffix = <(String, String) as PrimaryKey<'a>>::SuperSuffix;

    fn key(&self) -> Vec<Key> {
        // copied from the tuple impl bc this trait is stupid
        let mut keys = self.org.key();
        keys.extend(self.repo.key());
        keys
    }
}

impl KeyDeserialize for Repo {
    type Output = Repo;

    const KEY_ELEMS: u16 = <(String, String) as KeyDeserialize>::KEY_ELEMS;

    fn from_vec(value: Vec<u8>) -> cosmwasm_std::StdResult<Self::Output> {
        let (org, repo) = <(String, String) as KeyDeserialize>::from_vec(value)?;

        Ok(Self { org, repo })
    }
}

impl<T: Into<String>, U: Into<String>> From<(T, U)> for Repo {
    fn from((org, repo): (T, U)) -> Self {
        Self {
            org: org.into(),
            repo: repo.into(),
        }
    }
}

impl From<Repo> for (String, String) {
    fn from(repo: Repo) -> Self {
        (repo.org, repo.repo)
    }
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
