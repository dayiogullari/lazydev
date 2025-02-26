use cosmwasm_std::StdError;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("only lazydev")]
    OnlyLazydev,
    #[error("invalid config")]
    InvalidConfig(StdError),
}
