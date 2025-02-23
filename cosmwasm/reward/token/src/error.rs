use cosmwasm_std::StdError;
use lazydev::state::Repo;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("only lazydev")]
    OnlyLazydev,
    #[error("repo {}/{} not allowed", .0.org, .0.repo)]
    InvalidRepo(Repo),
    #[error("invalid config")]
    InvalidConfig(StdError),
}
