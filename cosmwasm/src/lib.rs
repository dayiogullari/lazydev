#![cfg_attr(not(test), warn(clippy::pedantic, clippy::unwrap_used, clippy::panic))]
#![allow(clippy::missing_errors_doc, clippy::missing_panics_doc)]

pub mod contract;
pub mod error;
pub mod models;
pub mod msg;
pub mod state;

// #[cfg(test)]
// mod tests {

//     use cosmwasm_std::testing::{message_info, mock_dependencies, mock_env};

//     use crate::{
//         contract::{execute, instantiate},
//         msg::{ExecuteMsg, InstantiateMsg, LinkRepoMsg, RewardPrMsg},
//         state::{LabelConfig, Repo, RepoConfig},
//     };

//     #[test]
//     fn test() {
//         let mut deps = mock_dependencies();
//         let env = mock_env();

//         let sender = deps.api.addr_make("sender");
//         let verifier = deps.api.addr_make("verifier");

//         let rewarder = deps.api.addr_make("rewarder");

//         let res = instantiate(
//             deps.as_mut(),
//             env.clone(),
//             message_info(&sender, &[]),
//             InstantiateMsg {
//                 verifier_address: verifier,
//                 commitment_delay_min_height: 0,
//                 commitment_delay_max_height: 0,
//             },
//         )
//         .unwrap();

//         dbg!(res);

//         let res = execute(
//             deps.as_mut(),
//             env.clone(),
//             message_info(&sender, &[]),
//             ExecuteMsg::LinkRepo(LinkRepoMsg {
//                 repo: Repo {
//                     org: "org".to_owned(),
//                     repo: "repo".to_owned(),
//                 },
//                 config: RepoConfig {
//                     label_configs: [(
//                         1,
//                         LabelConfig {
//                             reward_contract: rewarder,
//                         },
//                     )]
//                     .into_iter()
//                     .collect(),
//                 },
//             }),
//         )
//         .unwrap();

//         dbg!(res);

//         let res = execute(
//             deps.as_mut(),
//             env.clone(),
//             message_info(&sender, &[]),
//             ExecuteMsg::RewardPr(RewardPrMsg { proof: todo!() }),
//         )
//         .unwrap();

//         dbg!(res);
//     }
// }
