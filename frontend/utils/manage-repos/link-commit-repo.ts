import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { Decimal } from "@cosmjs/math";
import { LazydevClient } from "@/ts/lazydev/Lazydev.client";
import { generateSecret, generateCommitmentKey } from "@/utils/lazydev-helpers";
import { RepoConfig, Repo } from "@/ts/lazydev/Lazydev.types";

interface Session {
  user: {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    githubUsername?: string | null;
  };
  accessToken: string;
  accessInstallationToken?: string;
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

export const CONTRACT_ADDRESS =
  "neutron17763lnw3wp74zg8etdpultvj2sysx2qrsv0hwrjay3dwyyd9uqyqhcxr86";
export const RPC_URL = "https://rpc.pion.rs-testnet.polypore.xyz";

const getSigningClient = async (walletAddress: string) => {
  const offlineSigner = window.getOfflineSigner?.("pion-1");
  if (!offlineSigner) throw new Error("No signer available");

  const signingClient = await SigningCosmWasmClient.connectWithSigner(
    RPC_URL,
    offlineSigner,
    {
      gasPrice: {
        denom: "untrn",
        amount: Decimal.fromUserInput("0.025", 3),
      },
    }
  );

  return new LazydevClient(signingClient, walletAddress, CONTRACT_ADDRESS);
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
    const [adminPermissionsProof, adminUserProof] = await Promise.all([
      fetch("http://35.159.105.116:8080/proof-repo-owner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoOwner: repoData.org,
          repo: repoData.repo,
          githubUsername: session.user.githubUsername,
          accessToken: session.accessInstallationToken,
        }),
      })
        .then((res) => res.json())
        .then((data) => data.proofData),

      fetch("http://35.159.105.116:8080/proof-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: session.accessToken }),
      })
        .then((res) => res.json())
        .then((data) => data.proofData),
    ]);

    const client = await getSigningClient(keplrWalletAddress);
    const result = await client.linkRepo({
      config: repoConfig,
      repo: repoData,
      repoAdminPermissionsProof: adminPermissionsProof,
      repoAdminUserProof: adminUserProof,
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
