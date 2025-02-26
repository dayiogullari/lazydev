/**
* This file was automatically generated by @cosmwasm/ts-codegen@1.12.1.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

export type Addr = string;
export interface InstantiateMsg {
  commitment_delay_max_height: number;
  commitment_delay_min_height: number;
  verifier_address: Addr;
}
export type ExecuteMsg = {
  link_account: LinkAccountMsg;
} | {
  commit_github_user_id: CommitGithubUserIdMsg;
} | {
  reward_pr: RewardPrMsg;
} | {
  commit_repo: CommitRepoMsg;
} | {
  link_repo: LinkRepoMsg;
};
export type Binary = string;
export interface LinkAccountMsg {
  proof: Proof;
  recipient_address: Addr;
  secret: Binary;
}
export interface Proof {
  claimInfo: ClaimInfo;
  signedClaim: SignedClaim;
}
export interface ClaimInfo {
  context: string;
  parameters: string;
  provider: string;
}
export interface SignedClaim {
  claim: CompleteClaimData;
  signatures: string[];
}
export interface CompleteClaimData {
  epoch: number;
  identifier: string;
  owner: string;
  timestampS: number;
}
export interface CommitGithubUserIdMsg {
  commitment_key: Binary;
  github_user_id: number;
  recipient_address: Addr;
}
export interface RewardPrMsg {
  proof: Proof;
}
export interface CommitRepoMsg {
  commitment_key: Binary;
  repo: Repo;
}
export interface Repo {
  org: string;
  repo: string;
}
export interface LinkRepoMsg {
  config: RepoConfig;
  repo: Repo;
}
export interface RepoConfig {
  label_configs: {};
}
export type QueryMsg = {
  linked_address: {
    github_user_id: number;
  };
} | {
  repos: {};
} | {
  query_pr_eligibility: {
    github_user_id: number;
    pr_id: number;
    repo: Repo;
  };
};
export interface MigrateMsg {}
export type NullableAddr = Addr | null;
export type Boolean = boolean;
export type ArrayOfRepo = Repo[];