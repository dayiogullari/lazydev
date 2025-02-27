import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { Decimal } from "@cosmjs/math";
import { LazydevClient } from "@/ts/lazydev/Lazydev.client";
import { generateSecret, generateCommitmentKey } from "@/utils/lazydev-helpers";
import { RepoConfig, Repo } from "@/ts/lazydev/Lazydev.types";
import { rpc_url, contract_address } from "@/utils/consts";

interface Session {
  user: {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    githubUsername?: string | null;
  };
  accessToken: string;
}

export interface CommitRepoParams {
  repoConfig: RepoConfig;
  repoData: Repo;
  keplrWalletAddress: string;
}

export interface LinkRepoParams extends CommitRepoParams {
  session: Session;
  secret: string;
}

const getSigningClient = async (walletAddress: string) => {
  const offlineSigner = window.getOfflineSigner?.("pion-1");
  if (!offlineSigner) throw new Error("No signer available");

  const signingClient = await SigningCosmWasmClient.connectWithSigner(rpc_url, offlineSigner, {
    gasPrice: {
      denom: "untrn",
      amount: Decimal.fromUserInput("0.025", 3),
    },
  });

  return new LazydevClient(signingClient, walletAddress, contract_address);
};

export const commitRepository = async ({
  repoConfig,
  repoData,
  keplrWalletAddress,
}: CommitRepoParams) => {
  const secret = generateSecret();
  const commitmentKey = generateCommitmentKey(secret);

  try {
    const client = await getSigningClient(keplrWalletAddress);
    const result = await client.commitRepo({
      commitmentKey,
      config: repoConfig,
      repo: repoData,
    });

    return {
      success: true,
      txHash: result.transactionHash,
      secret: secret,
    };
  } catch (error) {
    console.error("Failed to commit repo:", error);
    throw error;
  }
};

export const linkRepository = async ({
  repoConfig,
  repoData,
  keplrWalletAddress,
  session,
  secret,
}: LinkRepoParams) => {
  try {
    const adminPermissionsProof = await fetch("https://backend.lazydev.zone/proof-repo-owner", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        repoOwner: repoData.org,
        repo: repoData.repo,
        githubUsername: session.user.githubUsername,
        accessToken: session.accessToken,
      }),
    })
      .then((res) => res.json())
      .then((data) => data.proofData);
    const client = await getSigningClient(keplrWalletAddress);
    const result = await client.linkRepo({
      config: repoConfig,
      repo: repoData,
      repoAdminPermissionsProof: adminPermissionsProof,
      secret,
    });

    return {
      success: true,
      txHash: result.transactionHash,
    };
  } catch (error) {
    console.error("Failed to link repo:", error);
    throw error;
  }
};

export const queryRepoStatus = async (repo: Repo) => {
  try {
    const client = await getSigningClient("");
    const repoConfig = await client.repoConfig({ repo });
    return {
      isCommitted: repoConfig !== null,
      config: repoConfig,
    };
  } catch (error) {
    console.error("Failed to query repo status:", error);
    throw error;
  }
};
