use cosmwasm_std::Binary;

use crate::state::Repo;

#[derive(Debug, PartialEq, thiserror::Error)]
pub enum Error {
    #[error("user {0} not found")]
    UserNotFound(u64),
    #[error("proof has already been submitted")]
    ProofAlreadySubmitted,
    #[error("invalid pull request url")]
    InvalidPrUrl,
    #[error("invalid collaborator url")]
    InvalidCollaboratorUrl,
    #[error("user commitment for {0} not found")]
    UserCommitmentNotFound(u64),
    #[error("repo commitment for {}/{} not found", .0.org, .0.repo)]
    RepoCommitmentNotFound(Repo),
    #[error("commitment key {0} already exists")]
    CommitmentAlreadyExists(Binary),
    #[error("commitments must be 32 bytes, found {0}")]
    InvalidCommitmentLength(usize),
    #[error("pr {0} has already been rewarded")]
    PrAlreadyRewarded(u64),
    #[error("unable to deserialize context: {0}")]
    InvalidContext(serde_json_wasm::de::Error),
    #[error("unable to deserialize extracted parameters: {0}")]
    InvalidExtractedParameters(serde_json_wasm::de::Error),
    #[error("invalid repo")]
    InvalidRepo,
    #[error("pr is not merged")]
    PrNotMerged,
    #[error("invalid user id")]
    InvalidUserId,
    #[error("commitment is expired")]
    CommitmentExpired,
    #[error("invalid commitment key")]
    InvalidCommitmentKey,
    #[error("user is not admin on the repo")]
    InsufficientPermissions,
    #[error("invalid commitment")]
    InvalidCommitment,
}
