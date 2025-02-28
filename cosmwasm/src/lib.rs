#![cfg_attr(not(test), warn(clippy::pedantic, clippy::unwrap_used, clippy::panic))]
#![allow(clippy::missing_errors_doc, clippy::missing_panics_doc)]

use cosmwasm_std::{to_json_string, Event};

use crate::{contract::SERIALIZATION_INFALLIBLE_MSG, models::reward::PrReward, state::Repo};

pub mod contract;
pub mod error;
pub mod models;
pub mod msg;
pub mod state;
pub mod utils;

pub mod event {
    pub const REWARD: &str = "reward";
    pub mod attribute {
        pub const REWARD: &str = "reward";
        pub const ORG: &str = "org";
        pub const REPO: &str = "repo";
        pub const PR: &str = "pr";
        pub const USER: &str = "user";
        pub const RECIPIENT: &str = "user";
    }
}

/// Construct the event for the lazydev reward.
#[must_use]
pub fn reward_event(
    reward: &PrReward,
    repo: Repo,
    pr_id: u64,
    user_id: u64,
    recipient: String,
) -> Event {
    Event::new(event::REWARD)
        .add_attribute(
            event::attribute::REWARD,
            to_json_string(&reward).expect(SERIALIZATION_INFALLIBLE_MSG),
        )
        .add_attributes([
            (event::attribute::ORG, repo.org),
            (event::attribute::REPO, repo.repo),
            (event::attribute::PR, pr_id.to_string()),
            (event::attribute::USER, user_id.to_string()),
            (event::attribute::RECIPIENT, recipient),
        ])
}
