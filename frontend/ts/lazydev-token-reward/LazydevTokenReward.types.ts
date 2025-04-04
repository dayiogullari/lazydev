/**
 * This file was automatically generated by @cosmwasm/ts-codegen@1.12.1.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run the @cosmwasm/ts-codegen generate command to regenerate this file.
 */

export type Addr = string;
export interface InstantiateMsg {
  config: Config;
  lazydev_address: Addr;
}
export interface Config {
  cw20_base_code_id: number;
  decimals: number;
  name: string;
  symbol: string;
  valid_orgs: string[];
  valid_repos: Repo[];
}
export interface Repo {
  org: string;
  repo: string;
}
export type ExecuteMsg = {
  reward: RewardMsg;
};
export interface RewardMsg {
  pr_id: number;
  recipient_address: Addr;
  repo: Repo;
  reward_config: string;
  user_id: number;
}
export type QueryMsg = {
  rewards: RewardMsg;
};
export interface MigrateMsg {}
export type PrReward = {
  token: {
    amount: Uint128;
    denom: string;
  };
};
export type Uint128 = string;
export interface QueryRewardsResponse {
  claimed: boolean;
  rewards: PrReward[];
}
