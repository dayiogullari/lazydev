import { LazydevClient } from "@/ts/lazydev/Lazydev.client";
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

interface ClaimRewardParams {
	keplrWalletAddress: string | null;
	setClaimingPrUrl: React.Dispatch<React.SetStateAction<string | null>>;
	setTxHashes: React.Dispatch<React.SetStateAction<Record<string, string>>>;
	setClaimedPrs: React.Dispatch<React.SetStateAction<Set<string>>>;
	setInvalidRepos: React.Dispatch<React.SetStateAction<Set<string>>>;

	contribution: Contribution;

	contractAddress: string;
	rpcUrl: string;
}

export async function claimReward({
	keplrWalletAddress,
	setClaimingPrUrl,
	setTxHashes,
	setClaimedPrs,
	setInvalidRepos,
	contribution,
	contractAddress,
	rpcUrl,
}: ClaimRewardParams) {
	if (!keplrWalletAddress) {
		toast.error("Connect Wallet first");
		return;
	}

	try {
		setClaimingPrUrl(contribution.prUrl);

		const prUrlRegex = /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)$/;
		const match = contribution.prUrl.match(prUrlRegex);

		if (!match) {
			throw new Error(
				"Invalid GitHub PR URL. Must be a pull request link like https://github.com/org/repo/pull/123",
			);
		}

		const [org, repo, pullId] = match;
		const requestBody = { org, repo, pullId };

		const proofResponse = await fetch("http://35.159.105.116:8080/proof-pr", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(requestBody),
		});

		if (!proofResponse.ok) {
			throw new Error("Failed to get proof data from proof-pr endpoint");
		}

		const { proofData } = await proofResponse.json();

		const offlineSigner = window.getOfflineSigner?.("pion-1");
		if (!offlineSigner) throw new Error("No signer available");

		const signingClient = await SigningCosmWasmClient.connectWithSigner(
			rpcUrl,
			offlineSigner,
			{
				gasPrice: {
					denom: "untrn",
					amount: Decimal.fromUserInput("0.025", 3),
				},
			},
		);

		const lazydevClient = new LazydevClient(
			signingClient,
			keplrWalletAddress,
			contractAddress,
		);

		const txResult = await lazydevClient.rewardPr({ proof: proofData });

		setTxHashes((prev) => ({
			...prev,
			[contribution.prUrl]: txResult.transactionHash,
		}));

		setClaimedPrs((prev) => new Set([...prev, contribution.prUrl]));
		toast.success("Reward claimed successfully!");
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";

		if (errorMessage.includes("already been rewarded")) {
			setClaimedPrs((prev) => new Set([...prev, contribution.prUrl]));
			toast.error("This contribution has already been claimed");
		} else if (errorMessage.includes("invalid repo")) {
			setInvalidRepos((prev) => new Set([...prev, contribution.prUrl]));
			toast.error("Invalid repository - not eligible for rewards");
		} else {
			toast.error(`Claim failed: ${errorMessage}`);
		}
	} finally {
		setClaimingPrUrl(null);
	}
}
