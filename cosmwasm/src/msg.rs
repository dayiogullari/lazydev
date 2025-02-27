use cosmwasm_schema::{cw_serde, QueryResponses};
use cosmwasm_std::{Addr, Binary};

use crate::{
    models::{reclaim::Proof, reward::PrReward},
    state::{Repo, RepoConfig},
};

#[cw_serde]
pub struct InstantiateMsg {
    /// The address of the pre-deployed reclaim verifier contract.
    ///
    /// Supported cosmos chains can be found [here][reclaim-cosmos].
    ///
    /// [reclaim-cosmos]: https://docs.reclaimprotocol.org/sdk/cosmos
    pub verifier_address: Addr,
    pub commitment_delay_min_height: u64,
    pub commitment_delay_max_height: u64,
}

#[cw_serde]
#[allow(clippy::large_enum_variant)]
pub enum ExecuteMsg {
    CommitAccount(CommitAccountMsg),
    LinkAccount(LinkAccountMsg),

    RewardPr(RewardPrMsg),

    CommitRepo(CommitRepoMsg),
    LinkRepo(LinkRepoMsg),
}

/// Commit to linking an address with a proof in a future message.
///
/// In order to prevent a user proof being frontrun and assigned to a different recipient address,
/// linking an account is done in two steps via a commit/reveal scheme (inspired by [ens]). A secret
/// is generated client side, and then the sha256 sum of this secret is committed as the key to the
/// (id, addr) that will later be linked. Once this is committed on chain, the client can then read
/// the commitment and ensure that it was indeed committed as expected (i.e. that it was not
/// frontrun), and then submit a [`LinkAccount`] transaction which itself contains the the zktls
/// proof for the user account, along with the raw secret. Since only one commitement can be
/// submitted per github user id (see [`USER_COMMITMENTS`][crate::state::USER_COMMITEMENTS]), it is
/// not possible for this link account message proof to be frontrun.
///
/// [ens]: https://support.ens.domains/en/articles/7900438-registration-steps
#[cw_serde]
pub struct CommitAccountMsg {
    /// sha256(secret)
    pub commitment_key: Binary,
    // KEY
    /// The id of the user to be associated with the recipient address.
    pub github_user_id: u64,
    // VALUE
    /// The address to be linked to the github user id.
    pub recipient_address: Addr,
}

/// Link a github user id with a recipient address with a zktls proof of the user's account.
///
/// This is the second phase of the account linking (see [`CommitGithubUserId`] for more
/// information).
#[cw_serde]
pub struct LinkAccountMsg {
    /// The address to be linked to the github user id.
    pub recipient_address: Addr,
    /// The zktls proof of the user account. This also contains the user id.
    ///
    /// This proof is of the <https://api.github.com/user> endpoint, called with an authenticated user. If the call to this endpoint is successfull, we can be sure that the submitter of this proof is indeed the account owner.
    pub proof: Proof,
    /// The secret that was generated client side during the [`CommitGithubUserId`] step.
    pub secret: Binary,
}

/// Reward a PR with a zktls proof of the pull request.
#[cw_serde]
pub struct RewardPrMsg {
    /// The zktls proof of the PR from github.
    ///
    /// This proof is of the <https://api.github.com/repos/ORG/REPO/pulls/ID> endpoint. The zktls proof verifies the authenticity of the pull request state and contents, ensuring that a user cannot fabricate a PR that will give them unearned rewards.
    pub proof: Proof,
}

/// Commit to linking a repository as a repo admin.
///
/// Linking a repo uses the same commit/reveal schema as [`CommitAccountMsg`].
#[cw_serde]
pub struct CommitRepoMsg {
    /// sha256(secret)
    pub commitment_key: Binary,
    // KEY
    /// The repo that will be linked.
    pub repo: Repo,
    // VALUE
    /// The repo that will be linked.
    pub config: RepoConfig,
}

/// Link a repo as an admin. This follows the same commit/reveal scheme as [`LinkAccount`].
#[cw_serde]
pub struct LinkRepoMsg {
    pub repo: Repo,
    pub config: RepoConfig,
    /// The secret that was generated client side during the [`CommitRepoMsg`] step.
    pub secret: Binary,
    /// The zktls proof of the user's permissions of the github repo.
    ///
    /// This is a proof of the
    /// (`/repos/{owner}/{repo}/collaborators/{username}/permission`)[endpoint] endpoint.
    ///
    /// [endpoint]: https://docs.github.com/en/rest/collaborators/collaborators?apiVersion=2022-11-28#get-repository-permissions-for-a-user
    pub repo_admin_permissions_proof: Proof,
}

#[cw_serde]
#[derive(QueryResponses)]
pub enum QueryMsg {
    /// Returns the linked account of a github user, or [`None`] if the user has not yet been
    /// linked.
    #[returns(Option<Addr>)]
    LinkedAddress { github_user_id: u64 },
    /// Returns all of the configured repos.
    #[returns(Vec<Repo>)]
    Repos {},
    /// Returns all of the configured repos.
    #[returns(Option<RepoConfig>)]
    RepoConfig { repo: Repo },
    /// Returns whether a PR is eligible for rewards.
    #[returns(PrEligibility)]
    QueryPrEligibility {
        repo: Repo,
        pr_id: u64,
        github_user_id: u64,
    },
}

#[cw_serde]
pub enum PrEligibility {
    /// The PR has already been claimed.
    Claimed,
    /// The PR is eligble for rewards.
    Eligible,
    /// The PR is not eligible for rewards, either because the user has not yet linked their
    /// account or the repo is not configured for rewards.
    Ineligible,
}

/// The migration message for lazydev.
///
/// This is empty since no migrations are currently supported or required.
#[cw_serde]
pub struct MigrateMsg {}

/// ExecuteMsg interface for the verifier contract.
#[cw_serde]
pub enum VerifierMsg {
    VerifyProof(VerifyProofMsg),
}

#[cw_serde]
pub struct VerifyProofMsg {
    pub proof: Proof,
}

/// ExecuteMsg interface for reward contracts.
#[cw_serde]
pub enum RewardExecuteMsg {
    Reward(RewardMsg),
}

/// The reward callback message for the reward contracts. This is expected to be
/// in an `ExecuteMsg` under the key `"reward"`.
#[cw_serde]
pub struct RewardMsg {
    /// The repo that the rewards are for.
    pub repo: Repo,
    /// The github pr id that the rewards are for.
    pub pr_id: u64,
    /// The github user id of the user receiving the reward.
    pub user_id: u64,
    /// The recipient address to send the rewards to.
    pub recipient_address: Addr,
    /// Additional reward config.
    pub reward_config: String,
}

/// QueryMsg interface for reward contracts.
///
/// NOTE: This assumes that the user is eligible for these rewards. Since this query is not
/// permissioned, it is up to the caller to check for eligibility before making any assumptions.
#[cw_serde]
#[derive(QueryResponses)]
pub enum RewardQueryMsg {
    /// Query the rewards that this contract will send to recipient_address.
    #[returns(QueryRewardsResponse)]
    Rewards(RewardMsg),
}

#[cw_serde]
pub struct QueryRewardsResponse {
    /// Whether or not these rewards have already been claimed. If `true`, then `rewards` is the
    /// *actual* reward that the user received when they originally claimed the rewards.
    pub claimed: bool,
    pub rewards: Vec<PrReward>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn query_msg_serde() {
        let json = serde_json_wasm::to_string(&QueryMsg::Repos {}).unwrap();

        assert_eq!(json, r#"{"repos":{}}"#);
    }
}
