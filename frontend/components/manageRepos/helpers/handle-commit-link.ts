import toast from "react-hot-toast";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { Decimal } from "@cosmjs/math";
import { LazydevClient } from "@/ts/lazydev/Lazydev.client";
import { generateSecret, generateCommitmentKey } from "@/utils/lazydev-helpers";
import { fromBase64, toBase64 } from "@cosmjs/encoding";
import { ConfigItem, RepoDetails, Session } from "./types";

export const repoHelpers = {
	_commitRepo: async (
		selectedRepo: RepoDetails,
		configurations: ConfigItem[],
		session: Session,
		keplrWalletAddress: string,
		setIsCommitting: (isCommitting: boolean) => void,
		setCommitTxHash: (hash: string) => void,
		setIsCommitted: (isCommitted: boolean) => void,
	) => {
		if (!selectedRepo || !configurations.length || !session) return;

		setIsCommitting(true);

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
				"https://rpc.pion.rs-testnet.polypore.xyz",
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
				"neutron17763lnw3wp74zg8etdpultvj2sysx2qrsv0hwrjay3dwyyd9uqyqhcxr86",
			);

			const result = await lazydevClient.commitRepo({
				commitmentKey,
				config: repoConfig,
				repo: repoData,
			});

			localStorage.setItem(`repo_${selectedRepo.id}_secret`, toBase64(secret));
			localStorage.setItem(`repo_${selectedRepo.id}_commitment`, commitmentKey);
			setCommitTxHash(result.transactionHash);
			setIsCommitted(true);
			toast.success("Repository configuration committed successfully!");

			return result;
		} catch (error) {
			console.error("Failed to commit repo:", error);
			toast.error(
				error instanceof Error ? error.message : "Failed to commit repository",
			);
			throw error;
		} finally {
			setIsCommitting(false);
		}
	},

	linkRepo: async (
		selectedRepo: RepoDetails,
		configurations: ConfigItem[],
		session: Session,
		keplrWalletAddress: string,
		setIsCommitting: (isCommitting: boolean) => void,
		setCommitTxHash: (hash: string) => void,
		setIsCommitted: (isCommitted: boolean) => void,
		setIsLinked: (isLinked: boolean) => void,
	) => {
		await repoHelpers._commitRepo(
			selectedRepo,
			configurations,
			session,
			keplrWalletAddress,
			setIsCommitting,
			setCommitTxHash,
			setIsCommitted,
		);

		if (!selectedRepo || !session || !keplrWalletAddress) {
			toast.error("Missing required connection data");
			return;
		}

		const [org, repoName] = selectedRepo.fullName.split("/");

		try {
			setIsCommitting(true);

			const savedSecret = localStorage.getItem(
				`repo_${selectedRepo.id}_secret`,
			);
			if (!savedSecret) {
				throw new Error("No saved secret found. Please commit the repo first.");
			}

			const adminPermissionsProofResponse = await fetch(
				"http://35.159.105.116:8080/proof-repo-owner",
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						repoOwner: org,
						repo: repoName,
						githubUsername: session.user.githubUsername,
						accessToken: session.accessInstallationToken,
					}),
				},
			);
			const adminPermissionsProofData =
				await adminPermissionsProofResponse.json();
			const adminPermissionsProof = adminPermissionsProofData.proofData;

			const adminUserProofResponse = await fetch(
				"http://35.159.105.116:8080/proof-user",
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ accessToken: session.accessToken }),
				},
			);
			const adminUserProofData = await adminUserProofResponse.json();
			const adminUserProof = adminUserProofData.proofData;

			const offlineSigner = window.getOfflineSigner?.("pion-1");
			if (!offlineSigner) throw new Error("No signer available");

			const signingClient = await SigningCosmWasmClient.connectWithSigner(
				"https://rpc.pion.rs-testnet.polypore.xyz",
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
				"neutron17763lnw3wp74zg8etdpultvj2sysx2qrsv0hwrjay3dwyyd9uqyqhcxr86",
			);

			const repoConfig = {
				label_configs: configurations.map((config) => ({
					label_id: config.labelId,
					reward_config: config.reward_config,
					reward_contract: config.reward_contract,
				})),
			};

			const repoData = { org, repo: repoName };

			const txResult = await lazydevClient.linkRepo({
				config: repoConfig,
				repo: repoData,
				repoAdminPermissionsProof: adminPermissionsProof,
				repoAdminUserProof: adminUserProof,
				secret: toBase64(fromBase64(savedSecret)),
			});

			toast.success("Repository linked successfully!");
			setIsLinked(true);
			return txResult;
		} catch (error) {
			console.error("Failed to link repo:", error);
			const errorMessage =
				error instanceof Error
					? `Failed to link repository: ${error.message}`
					: "Failed to link repository: Unknown error";
			toast.error(errorMessage);
			throw error;
		} finally {
			setIsCommitting(false);
		}
	},
};
