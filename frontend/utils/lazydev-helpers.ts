import { toast } from "react-hot-toast";
import { Decimal } from "@cosmjs/math";
import { toBase64 } from "@cosmjs/encoding";
import { sha256 } from "@cosmjs/crypto";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { Window as KeplrWindow } from "@keplr-wallet/types";
import { LazydevClient } from "@/ts/lazydev/Lazydev.client";

declare global {
	// eslint-disable-next-line @typescript-eslint/no-empty-object-type
	interface Window extends KeplrWindow {}
}

type FlowStep = "commit" | "waiting" | "link" | "complete";

// Generate a random 32-byte secret (Uint8Array).

export function generateSecret(): Uint8Array {
	const arr = new Uint8Array(32);
	crypto.getRandomValues(arr);
	return arr;
}

// Generate a base64-encoded commitment key.
// Combines the userId (in hex form) and the secret, then hashes with sha256.

export function generateCommitmentKey(s: Uint8Array): string {
	return toBase64(sha256(s));
}

export async function handleConnectWallet({
	connectKeplrWallet,
	setIsLoading,
	isLinked,
	setCurrentStep,
}: {
	connectKeplrWallet: (chainId?: string) => void;
	setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
	isLinked: boolean;
	setCurrentStep: React.Dispatch<React.SetStateAction<FlowStep>>;
}) {
	try {
		setIsLoading(true);
		connectKeplrWallet();

		toast.success("Wallet connected successfully!");
		if (!isLinked) {
			setCurrentStep("commit");
		}
	} catch (error) {
		console.error("Wallet connection error:", error);
		toast.error("Failed to connect wallet");
		setCurrentStep("commit");
	} finally {
		setIsLoading(false);
	}
}

export async function handleCommitStep({
	githubUserId,
	keplrWalletAddress,
	rpcUrl,
	contractAddress,
	setIsLoading,
	setCurrentStep,
	setSecret,
	setCommitTxHash,
}: {
	githubUserId: number | null;
	keplrWalletAddress: string | null;
	rpcUrl: string;
	contractAddress: string;
	setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
	setCurrentStep: React.Dispatch<React.SetStateAction<FlowStep>>;
	setSecret: React.Dispatch<React.SetStateAction<Uint8Array | undefined>>;
	setCommitTxHash: React.Dispatch<React.SetStateAction<string | null>>;
}) {
	if (!githubUserId || !keplrWalletAddress) {
		// toast.error("Missing GitHub or wallet connection.");
		return;
	}

	try {
		setIsLoading(true);
		setCurrentStep("waiting");

		const newSecret = generateSecret();
		setSecret(newSecret);

		const commitmentKey = generateCommitmentKey(newSecret);

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

		const txResult = await lazydevClient.commitAccount({
			commitmentKey,
			githubUserId,
			recipientAddress: keplrWalletAddress,
		});

		setCommitTxHash(txResult.transactionHash);
		toast.success("GitHub ID committed successfully!");
	} catch (error) {
		setCurrentStep("commit");
		toast.error(
			`Commit failed: ${
				error instanceof Error ? error.message : "Unknown error"
			}`,
		);
		setIsLoading(false);
	}
}

// Link the GitHub account to the wallet on-chain.
export async function handleLinkStep({
	secret,
	keplrWalletAddress,
	githubToken,
	rpcUrl,
	contractAddress,
	setIsLoading,
	setLinkTxHash,
	setIsLinked,
	setLinkedWalletAddress,
	setCurrentStep,
	toastSuccessMessage,
}: {
	secret: Uint8Array | undefined;
	keplrWalletAddress: string | null;
	githubToken: string;
	rpcUrl: string;
	contractAddress: string;
	setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
	setLinkTxHash: React.Dispatch<React.SetStateAction<string | null>>;
	setIsLinked: React.Dispatch<React.SetStateAction<boolean>>;
	setLinkedWalletAddress: React.Dispatch<React.SetStateAction<string>>;
	setCurrentStep: React.Dispatch<React.SetStateAction<FlowStep>>;
	toastSuccessMessage?: string;
}) {
	if (!secret || !keplrWalletAddress) {
		toast.error("Missing secret or wallet address for linking.");
		return;
	}

	try {
		setIsLoading(true);

		const proofResponse = await fetch("http://35.159.105.116:8080/proof-user", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ accessToken: githubToken }),
		});
		if (!proofResponse.ok) throw new Error("Failed to get proof data");

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

		const txResult = await lazydevClient.linkAccount({
			recipientAddress: keplrWalletAddress,
			proof: proofData,
			secret: toBase64(secret),
		});

		setLinkTxHash(txResult.transactionHash);
		toast.success(toastSuccessMessage || "Account linked successfully!");
		setIsLinked(true);
		setLinkedWalletAddress(keplrWalletAddress);
		setCurrentStep("complete");
	} catch (error) {
		toast.error(
			`Linking failed: ${
				error instanceof Error ? error.message : "Unknown error"
			}`,
		);
	} finally {
		setIsLoading(false);
	}
}
