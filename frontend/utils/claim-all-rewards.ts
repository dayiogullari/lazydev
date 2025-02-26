import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { Decimal } from "@cosmjs/math";
import { toast } from "react-hot-toast";

interface Contribution {
  repo: string;
  prUrl: string;
  date: string;
  description: string;
  status?: string;
  points?: number;
  proof?: string;
}

interface ClaimAllRewardsParams {
  keplrWalletAddress: string | null;
  contributions: Contribution[];

  claimedPrs: Set<string>;
  setClaimedPrs: React.Dispatch<React.SetStateAction<Set<string>>>;
  invalidRepos: Set<string>;
  setInvalidRepos: React.Dispatch<React.SetStateAction<Set<string>>>;
  setTxHashes: React.Dispatch<React.SetStateAction<Record<string, string>>>;

  contractAddress: string;
  rpcUrl: string;

  setIsClaimingAll: React.Dispatch<React.SetStateAction<boolean>>;
}

export async function claimAllRewards({
  keplrWalletAddress,
  contributions,
  claimedPrs,
  setClaimedPrs,
  invalidRepos,
  setInvalidRepos,
  setTxHashes,
  contractAddress,
  rpcUrl,
  setIsClaimingAll,
}: ClaimAllRewardsParams) {
  if (!keplrWalletAddress) {
    toast.error("Connect Wallet first");
    return;
  }

  setIsClaimingAll(true);

  try {
    const offlineSigner = window.getOfflineSigner?.("pion-1");
    if (!offlineSigner) throw new Error("No signer available");

    const signingClient = await SigningCosmWasmClient.connectWithSigner(rpcUrl, offlineSigner, {
      gasPrice: {
        denom: "untrn",
        amount: Decimal.fromUserInput("0.025", 3),
      },
    });

    const validContributions = contributions.filter(
      (c) => !claimedPrs.has(c.prUrl) && !invalidRepos.has(c.prUrl),
    );

    if (validContributions.length === 0) {
      toast.error("No valid contributions to claim.");
      return;
    }

    const fetchPromises = validContributions.map(async (contribution) => {
      const prUrlRegex = /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)$/;
      const match = contribution.prUrl.match(prUrlRegex);

      if (!match) {
        setInvalidRepos((prev) => new Set([...prev, contribution.prUrl]));
        throw new Error(`Invalid PR URL: ${contribution.prUrl}`);
      }

      const [, org, repo, pullId] = match;
      const requestBody = { org, repo, pullId };

      const proofResponse = await fetch("https://backend.lazydev.zone/proof-pr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!proofResponse.ok) {
        throw new Error(`Failed to get proof for ${contribution.prUrl}`);
      }

      const { proofData } = await proofResponse.json();
      return { contribution, proofData };
    });

    const results = await Promise.allSettled(fetchPromises);

    const instructions: Array<{
      contractAddress: string;
      msg: Record<string, unknown>;
    }> = [];
    const prUrlsToMarkAsClaimed: string[] = [];

    results.forEach((result) => {
      if (result.status === "fulfilled") {
        const { contribution, proofData } = result.value;
        instructions.push({
          contractAddress,
          msg: {
            reward_pr: {
              proof: proofData,
            },
          },
        });
        prUrlsToMarkAsClaimed.push(contribution.prUrl);
      } else {
        const errorMsg = result.reason?.message || result.reason || "Unknown error";
        console.error("Proof fetch error:", errorMsg);
        toast.error(errorMsg);
      }
    });

    if (instructions.length === 0) {
      toast.error("No valid proofs to claim.");
      return;
    }

    const txResult = await signingClient.executeMultiple(keplrWalletAddress, instructions, "auto");

    setTxHashes((prev) => {
      const newHashes = { ...prev };
      for (const prUrl of prUrlsToMarkAsClaimed) {
        newHashes[prUrl] = txResult.transactionHash;
      }
      return newHashes;
    });

    setClaimedPrs((prev) => new Set([...prev, ...prUrlsToMarkAsClaimed]));

    toast.success("All contributions claimed successfully!");
  } catch (error) {
    if (error instanceof Error) {
      toast.error(error.message);
    } else {
      toast.error("Claim All failed unexpectedly.");
    }
  } finally {
    setIsClaimingAll(false);
  }
}
