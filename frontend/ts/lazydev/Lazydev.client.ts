/**
 * This file was automatically generated by @cosmwasm/ts-codegen@1.12.1.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run the @cosmwasm/ts-codegen generate command to regenerate this file.
 */

import { CosmWasmClient, SigningCosmWasmClient, ExecuteResult } from "@cosmjs/cosmwasm-stargate";
import { Coin, StdFee } from "@cosmjs/amino";
import {
  Addr,
  InstantiateMsg,
  ExecuteMsg,
  Binary,
  CommitAccountMsg,
  LinkAccountMsg,
  Proof,
  ClaimInfo,
  SignedClaim,
  CompleteClaimData,
  RewardPrMsg,
  CommitRepoMsg,
  RepoConfig,
  LabelConfig,
  Repo,
  LinkRepoMsg,
  QueryMsg,
  MigrateMsg,
  NullableAddr,
  PrEligibility,
  NullableRepoConfig,
  ArrayOfRepo,
} from "./Lazydev.types";
export interface LazydevReadOnlyInterface {
  contractAddress: string;
  linkedAddress: ({
    githubUserId,
  }: {
    githubUserId: number;
  }) => Promise<NullableAddr>;
  repos: () => Promise<ArrayOfRepo>;
  repoConfig: ({
    repo,
  }: {
    repo: Repo;
  }) => Promise<NullableRepoConfig>;
  queryPrEligibility: ({
    githubUserId,
    prId,
    repo,
  }: {
    githubUserId: number;
    prId: number;
    repo: Repo;
  }) => Promise<PrEligibility>;
}
export class LazydevQueryClient implements LazydevReadOnlyInterface {
  client: CosmWasmClient;
  contractAddress: string;
  constructor(client: CosmWasmClient, contractAddress: string) {
    this.client = client;
    this.contractAddress = contractAddress;
    this.linkedAddress = this.linkedAddress.bind(this);
    this.repos = this.repos.bind(this);
    this.repoConfig = this.repoConfig.bind(this);
    this.queryPrEligibility = this.queryPrEligibility.bind(this);
  }
  linkedAddress = async ({
    githubUserId,
  }: {
    githubUserId: number;
  }): Promise<NullableAddr> => {
    return this.client.queryContractSmart(this.contractAddress, {
      linked_address: {
        github_user_id: githubUserId,
      },
    });
  };
  repos = async (): Promise<ArrayOfRepo> => {
    return this.client.queryContractSmart(this.contractAddress, {
      repos: {},
    });
  };
  repoConfig = async ({
    repo,
  }: {
    repo: Repo;
  }): Promise<NullableRepoConfig> => {
    return this.client.queryContractSmart(this.contractAddress, {
      repo_config: {
        repo,
      },
    });
  };
  queryPrEligibility = async ({
    githubUserId,
    prId,
    repo,
  }: {
    githubUserId: number;
    prId: number;
    repo: Repo;
  }): Promise<PrEligibility> => {
    return this.client.queryContractSmart(this.contractAddress, {
      query_pr_eligibility: {
        github_user_id: githubUserId,
        pr_id: prId,
        repo,
      },
    });
  };
}
export interface LazydevInterface extends LazydevReadOnlyInterface {
  contractAddress: string;
  sender: string;
  commitAccount: (
    {
      commitmentKey,
      githubUserId,
      recipientAddress,
    }: {
      commitmentKey: Binary;
      githubUserId: number;
      recipientAddress: Addr;
    },
    fee_?: number | StdFee | "auto",
    memo_?: string,
    funds_?: Coin[],
  ) => Promise<ExecuteResult>;
  linkAccount: (
    {
      proof,
      recipientAddress,
      secret,
    }: {
      proof: Proof;
      recipientAddress: Addr;
      secret: Binary;
    },
    fee_?: number | StdFee | "auto",
    memo_?: string,
    funds_?: Coin[],
  ) => Promise<ExecuteResult>;
  rewardPr: (
    {
      proof,
    }: {
      proof: Proof;
    },
    fee_?: number | StdFee | "auto",
    memo_?: string,
    funds_?: Coin[],
  ) => Promise<ExecuteResult>;
  commitRepo: (
    {
      commitmentKey,
      config,
      repo,
    }: {
      commitmentKey: Binary;
      config: RepoConfig;
      repo: Repo;
    },
    fee_?: number | StdFee | "auto",
    memo_?: string,
    funds_?: Coin[],
  ) => Promise<ExecuteResult>;
  linkRepo: (
    {
      config,
      repo,
      repoAdminPermissionsProof,
      repoAdminUserProof,
      secret,
    }: {
      config: RepoConfig;
      repo: Repo;
      repoAdminPermissionsProof: Proof;
      repoAdminUserProof: Proof;
      secret: Binary;
    },
    fee_?: number | StdFee | "auto",
    memo_?: string,
    funds_?: Coin[],
  ) => Promise<ExecuteResult>;
}
export class LazydevClient extends LazydevQueryClient implements LazydevInterface {
  client: SigningCosmWasmClient;
  sender: string;
  contractAddress: string;
  constructor(client: SigningCosmWasmClient, sender: string, contractAddress: string) {
    super(client, contractAddress);
    this.client = client;
    this.sender = sender;
    this.contractAddress = contractAddress;
    this.commitAccount = this.commitAccount.bind(this);
    this.linkAccount = this.linkAccount.bind(this);
    this.rewardPr = this.rewardPr.bind(this);
    this.commitRepo = this.commitRepo.bind(this);
    this.linkRepo = this.linkRepo.bind(this);
  }
  commitAccount = async (
    {
      commitmentKey,
      githubUserId,
      recipientAddress,
    }: {
      commitmentKey: Binary;
      githubUserId: number;
      recipientAddress: Addr;
    },
    fee_: number | StdFee | "auto" = "auto",
    memo_?: string,
    funds_?: Coin[],
  ): Promise<ExecuteResult> => {
    return await this.client.execute(
      this.sender,
      this.contractAddress,
      {
        commit_account: {
          commitment_key: commitmentKey,
          github_user_id: githubUserId,
          recipient_address: recipientAddress,
        },
      },
      fee_,
      memo_,
      funds_,
    );
  };
  linkAccount = async (
    {
      proof,
      recipientAddress,
      secret,
    }: {
      proof: Proof;
      recipientAddress: Addr;
      secret: Binary;
    },
    fee_: number | StdFee | "auto" = "auto",
    memo_?: string,
    funds_?: Coin[],
  ): Promise<ExecuteResult> => {
    return await this.client.execute(
      this.sender,
      this.contractAddress,
      {
        link_account: {
          proof,
          recipient_address: recipientAddress,
          secret,
        },
      },
      fee_,
      memo_,
      funds_,
    );
  };
  rewardPr = async (
    {
      proof,
    }: {
      proof: Proof;
    },
    fee_: number | StdFee | "auto" = "auto",
    memo_?: string,
    funds_?: Coin[],
  ): Promise<ExecuteResult> => {
    return await this.client.execute(
      this.sender,
      this.contractAddress,
      {
        reward_pr: {
          proof,
        },
      },
      fee_,
      memo_,
      funds_,
    );
  };
  commitRepo = async (
    {
      commitmentKey,
      config,
      repo,
    }: {
      commitmentKey: Binary;
      config: RepoConfig;
      repo: Repo;
    },
    fee_: number | StdFee | "auto" = "auto",
    memo_?: string,
    funds_?: Coin[],
  ): Promise<ExecuteResult> => {
    return await this.client.execute(
      this.sender,
      this.contractAddress,
      {
        commit_repo: {
          commitment_key: commitmentKey,
          config,
          repo,
        },
      },
      fee_,
      memo_,
      funds_,
    );
  };
  linkRepo = async (
    {
      config,
      repo,
      repoAdminPermissionsProof,
      repoAdminUserProof,
      secret,
    }: {
      config: RepoConfig;
      repo: Repo;
      repoAdminPermissionsProof: Proof;
      repoAdminUserProof: Proof;
      secret: Binary;
    },
    fee_: number | StdFee | "auto" = "auto",
    memo_?: string,
    funds_?: Coin[],
  ): Promise<ExecuteResult> => {
    return await this.client.execute(
      this.sender,
      this.contractAddress,
      {
        link_repo: {
          config,
          repo,
          repo_admin_permissions_proof: repoAdminPermissionsProof,
          repo_admin_user_proof: repoAdminUserProof,
          secret,
        },
      },
      fee_,
      memo_,
      funds_,
    );
  };
}
