use cosmwasm_std::Binary;

#[derive(Debug, PartialEq, thiserror::Error)]
pub enum Error {
    #[error("proof has already been submitted")]
    ProofAlreadySubmitted,
    #[error("invalid pull request url")]
    InvalidPrUrl,
    #[error("commitment key {0} not found")]
    CommitmentKeyNotFound(Binary),
    #[error("commitment key {0} already exists")]
    CommitmentAlreadyExists(Binary),
    #[error("commitments must be 32 bytes, found {0}")]
    InvalidCommitmentLength(usize),
    #[error("pr {0} has already been rewarded")]
    PrAlreadyRewarded(u64),
    #[error("unable to verify proof: {0}")]
    InvalidProof(String),
    #[error("unable to deserialize context: {0}")]
    InvalidContext(serde_json_wasm::de::Error),
    #[error("unable to deserialize extracted parameters: {0}")]
    InvalidExtractedParameters(serde_json_wasm::de::Error),
    #[error("unable to deserialize parameters: {0}")]
    InvalidParameters(serde_json_wasm::de::Error),
    #[error("invalid repo")]
    InvalidRepo,
    #[error("pr is not merged")]
    PrNotMerged,
    #[error("invalid user id")]
    InvalidUserId,
    #[error("commitment is expired")]
    CommitmentExpired,
    #[error("commitment is for a different id")]
    InvalidCommitmentUserId,
    #[error("user is not admin on the repo")]
    InvalidUserPermission,
    #[error("the user proof is not for the user provided in the permissions proof")]
    UserProofNotForRepoAdmin,
    #[error("invalid repo commitment")]
    InvalidRepoCommitment,
}
