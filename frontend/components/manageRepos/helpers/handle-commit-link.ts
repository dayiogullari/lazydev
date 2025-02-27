import toast from "react-hot-toast";
import {
  CosmWasmClient,
  SigningCosmWasmClient,
} from "@cosmjs/cosmwasm-stargate";
import { Decimal } from "@cosmjs/math";
import { LazydevClient } from "@/ts/lazydev/Lazydev.client";
import { generateSecret, generateCommitmentKey } from "@/utils/lazydev-helpers";
import { toBase64 } from "@cosmjs/encoding";
import { rpc_url, contract_address } from "@/utils/consts";
import { ConfigItem, RepoDetails, Session } from "./types";
import { LazydevQueryClient } from "@/ts/lazydev/Lazydev.client";
import { RepoConfig } from "@/ts/lazydev/Lazydev.types";

export const repoHelpers = {
  _commitRepo: async (
    selectedRepo: RepoDetails,
    configurations: ConfigItem[],
    session: Session,
    keplrWalletAddress: string,
    setIsCommitted: (isCommitted: boolean) => void
  ) => {
    if (!selectedRepo || !configurations.length || !session) return;

    try {
      const secret = generateSecret();
      const commitmentKey = generateCommitmentKey(secret);
      const repoConfig = {
        label_configs: configurations.map((config) => ({
          label_id: config.labelId,
          reward_config: config.reward_config,
          reward_contract: config.reward_contract,
        })),
      };
      const [org, repo] = selectedRepo.fullName.split("/");
      const repoData = { org, repo };

      const offlineSigner = window.getOfflineSigner?.("pion-1");
      if (!offlineSigner) throw new Error("No signer available");

      const signingClient = await SigningCosmWasmClient.connectWithSigner(
        rpc_url,
        offlineSigner,
        {
          gasPrice: {
            denom: "untrn",
            amount: Decimal.fromUserInput("0.025", 3),
          },
        }
      );

      const lazydevClient = new LazydevClient(
        signingClient,
        keplrWalletAddress,
        contract_address
      );

      const result = await lazydevClient.commitRepo({
        commitmentKey,
        config: repoConfig,
        repo: repoData,
      });

      localStorage.setItem(`repo_${selectedRepo.id}_secret`, toBase64(secret));
      // localStorage.setItem(`repo_${selectedRepo.id}_commitment`, commitmentKey);
      setIsCommitted(true);
      toast.success("Repository configuration committed successfully!");

      return result;
    } catch (error) {
      console.error("Failed to commit repo:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to commit repository"
      );
      throw error;
    }
  },

  linkRepo: async ({
    selectedRepo,
    configurations,
    session,
    keplrWalletAddress,
    setIsConfiguring,
    setCommitTxHash,
    setIsCommitted,
    setIsLinked,
    setIsAlreadyLinked,
    setRepoConfigDiff,
    setOldCommitmentResult,
    acceptConfigDiff = false,
  }: {
    selectedRepo: RepoDetails;
    configurations: ConfigItem[];
    session: Session;
    keplrWalletAddress: string;
    setIsConfiguring: (isConfiguring: boolean) => void;
    setCommitTxHash: (hash: string) => void;
    setIsCommitted: (isCommitted: boolean) => void;
    setIsLinked: (isLinked: boolean) => void;
    setIsAlreadyLinked: (isAlreadyLinked: boolean) => void;
    setRepoConfigDiff: (repoConfigDiff: boolean) => void;
    setOldCommitmentResult: (arg0: RepoConfig | undefined) => void;
    acceptConfigDiff?: boolean;
  }) => {
    const [org, repoName] = selectedRepo.fullName.split("/");
    const repo = {
      org,
      repo: repoName,
    };

    const client = await CosmWasmClient.connect(rpc_url);
    const lazydevQueryClient = new LazydevQueryClient(client, contract_address);

    const repoCommitment = await lazydevQueryClient.repoCommitment({
      repo: repo,
    });
    const repoConfig = await lazydevQueryClient.repoConfig({
      repo: repo,
    });

    const chainLatestHeight = await client.getHeight();
    const lazydevConfig = await lazydevQueryClient.config();

    const currHeightDiff =
      chainLatestHeight - (repoCommitment?.commitment_height || 0);

    // if linked
    if (repoConfig) {
      setIsAlreadyLinked(true);
      setIsConfiguring(false);
      return;
    }

    // if not commited or linked
    if (
      (repoCommitment === null && repoConfig === null) ||
      currHeightDiff > lazydevConfig.commitment_delay_max_height
    ) {
      await repoHelpers._commitRepo(
        selectedRepo,
        configurations,
        session,
        keplrWalletAddress,
        setIsCommitted
      );
    }

    if (!selectedRepo || !session || !keplrWalletAddress) {
      toast.error("Missing required connection data");
      setIsConfiguring(false);
      return;
    }

    try {
      const savedSecret = localStorage.getItem(
        `repo_${selectedRepo.id}_secret`
      );
      if (!savedSecret) {
        throw new Error("No saved secret found. Please commit the repo first.");
      }

      // Create repo config from current config
      const repoConfig = {
        label_configs: configurations.map((config) => ({
          label_id: config.labelId,
          reward_config: config.reward_config,
          reward_contract: config.reward_contract,
        })),
      };

      setOldCommitmentResult(repoCommitment?.value);

      // Check for configuration diff
      const configsAreDifferent =
        JSON.stringify(repoCommitment?.value) !== JSON.stringify(repoConfig);

      // If configs are different and user didnt accept
      if (configsAreDifferent && !acceptConfigDiff) {
        setRepoConfigDiff(true);
        setIsConfiguring(false);
        return null;
      }

      const offlineSigner = window.getOfflineSigner?.("pion-1");
      if (!offlineSigner) throw new Error("No signer available");

      const signingClient = await SigningCosmWasmClient.connectWithSigner(
        rpc_url,
        offlineSigner,
        {
          gasPrice: {
            denom: "untrn",
            amount: Decimal.fromUserInput("0.025", 3),
          },
        }
      );

      const lazydevClient = new LazydevClient(
        signingClient,
        keplrWalletAddress,
        contract_address
      );

      // Use the committed configuration if the user has accepted config differences
      const configToUse =
        configsAreDifferent && repoCommitment?.value
          ? repoCommitment.value
          : repoConfig;

      const adminPermissionsProofResponse = await fetch(
        "https://backend.lazydev.zone/proof-repo-owner",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            repoOwner: org,
            repo: repoName,
            githubUsername: session.user.githubUsername,
            accessToken: session.accessToken,
          }),
        }
      );
      const adminPermissionsProofData =
        await adminPermissionsProofResponse.json();
      const adminPermissionsProof = adminPermissionsProofData.proofData;

      const txResult = await lazydevClient.linkRepo({
        config: configToUse,
        repo: repo,
        repoAdminPermissionsProof: adminPermissionsProof,
        secret: savedSecret,
      });
      setCommitTxHash(txResult.transactionHash);
      toast.success("Repository linked successfully!");
      setIsLinked(true);
      return txResult;
    } catch (error) {
      setIsConfiguring(false);
      console.error("Failed to link repo:", error);
      const errorMessage =
        error instanceof Error
          ? `Failed to link repository: ${error.message}`
          : "Failed to link repository: Unknown error";
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsConfiguring(false);
    }
  },
};
