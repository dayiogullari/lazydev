"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FaGithub, FaArrowLeft, FaTag, FaPlus, FaRocket } from "react-icons/fa";
import { CheckCircle, Loader2 } from "lucide-react";
import ReactJson from "react-json-view";
import toast from "react-hot-toast";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { Decimal } from "@cosmjs/math";
import { LazydevClient } from "@/ts/lazydev/Lazydev.client";
import { generateSecret, generateCommitmentKey } from "@/utils/lazydev-helpers";
import { toBase64 } from "@cosmjs/encoding";

interface ConfigItem {
	labelId: number;
	reward_contract: string;
	reward_config: string;
}

interface ConfigHistoryItem {
	timestamp: string;
	txHash: string;
	configurations: ConfigItem[];
}

interface AdminRepo {
	id: number;
	name: string;
	fullName: string;
	url: string;
	description: string;
	createdAt: string;
}

interface Label {
	id: number;
	name: string;
	color: string;
	description: string;
}

interface RepoDetails extends AdminRepo {
	labels: Label[];
}
interface ContractData {
	address: string;
	name: string;
	symbol: string;
	decimals: number;
	amountPerReward: string;
}

interface RepoDetailsProps {
	selectedRepo: RepoDetails;
	deployedContracts: ContractData[];
	onBack: () => void;
	sessionAccessToken: string;
	keplrWalletAddress: string;
}

export const RepoDetails: React.FC<RepoDetailsProps> = ({
	selectedRepo,
	deployedContracts,
	onBack,
	sessionAccessToken,
	keplrWalletAddress,
}) => {
	const [configHistory, setConfigHistory] = useState<ConfigHistoryItem[]>([]);
	const [selectedLabel, setSelectedLabel] = useState<string>("");
	const [selectedContract, setSelectedContract] = useState<string>("");
	const [config, setConfig] = useState<string>("");
	const [configurations, setConfigurations] = useState<ConfigItem[]>([]);
	const [showJson, setShowJson] = useState(false);
	const [isCommitting, setIsCommitting] = useState(false);
	const [isCommitted, setIsCommitted] = useState(false);
	const [commitTxHash, setCommitTxHash] = useState<string | null>(null);

	useEffect(() => {
		const savedHistory = localStorage.getItem(
			`repo_${selectedRepo.id}_history`,
		);
		if (savedHistory) {
			setConfigHistory(JSON.parse(savedHistory));
		}
	}, [selectedRepo.id]);

	const handleAddConfig = () => {
		if (!selectedLabel || !selectedContract || !config) return;
		const label = selectedRepo.labels.find(
			(l) => l.id.toString() === selectedLabel,
		);
		const contract = deployedContracts.find(
			(c) => c.address === selectedContract,
		);
		if (!label || !contract) return;
		const newConfig: ConfigItem = {
			labelId: label.id,
			reward_contract: contract.address,
			reward_config: config,
		};
		setConfigurations([...configurations, newConfig]);
		setSelectedLabel("");
		setSelectedContract("");
		setConfig("");
	};

	const handleCommitRepo = async () => {
		if (!selectedRepo || !configurations.length || !sessionAccessToken) return;
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

			if (result) {
				const historyItem: ConfigHistoryItem = {
					timestamp: new Date().toISOString(),
					txHash: result.transactionHash,
					configurations: [...configurations],
				};

				const newHistory = [historyItem, ...configHistory];
				setConfigHistory(newHistory);
				localStorage.setItem(
					`repo_${selectedRepo.id}_history`,
					JSON.stringify(newHistory),
				);
			}

			localStorage.setItem(`repo_${selectedRepo.id}_secret`, toBase64(secret));
			localStorage.setItem(`repo_${selectedRepo.id}_commitment`, commitmentKey);
			setCommitTxHash(result.transactionHash);
			setIsCommitted(true);
			toast.success("Repository configuration committed successfully!");
		} catch (error) {
			console.error("Failed to commit repo:", error);
			toast.error(
				error instanceof Error ? error.message : "Failed to commit repository",
			);
		} finally {
			setIsCommitting(false);
		}
	};

	return (
		<div className="space-y-6">
			<button
				onClick={onBack}
				className="flex items-center gap-2 text-slate-300 hover:text-slate-100 transition-colors"
			>
				<FaArrowLeft />
				Back to Repositories
			</button>
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="rounded-xl bg-[#0A0A0A] shadow-lg border border-zinc-800 p-6"
			>
				<div className="space-y-6">
					<div className="flex items-center justify-between">
						<h1 className="text-2xl font-bold text-slate-100">
							{selectedRepo.name}
						</h1>
						<Link
							href={selectedRepo.url}
							target="_blank"
							className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#09090B] text-[#c1c1c7] hover:bg-zinc-700 transition-colors"
						>
							<FaGithub />
							View on GitHub
						</Link>
					</div>
					<p className="text-slate-300">
						{selectedRepo.description || "No description provided"}
					</p>

					<div className="space-y-4">
						<div className="flex items-center gap-2">
							<FaTag className="text-emerald-400" />
							<h2 className="text-xl font-semibold text-slate-100">
								Configure Labels
							</h2>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<select
								value={selectedLabel}
								onChange={(e) => setSelectedLabel(e.target.value)}
								className="px-4 py-2 rounded-md bg-[#09090B] text-[#c1c1c7] border border-zinc-800"
							>
								<option value="">Select Label</option>
								{selectedRepo.labels.map((label) => (
									<option key={label.id} value={label.id}>
										{label.name}
									</option>
								))}
							</select>
							<select
								value={selectedContract}
								onChange={(e) => setSelectedContract(e.target.value)}
								className="px-4 py-2 rounded-md bg-[#09090B] text-[#c1c1c7] border border-zinc-800"
							>
								<option value="">Select Contract</option>
								{deployedContracts.map((contract) => (
									<option key={contract.address} value={contract.address}>
										{contract.name} ({contract.symbol})
									</option>
								))}
							</select>
							<div className="flex gap-2">
								<input
									value={config}
									onChange={(e) => setConfig(e.target.value)}
									placeholder="Enter config"
									className="flex-1 px-4 py-2 rounded-md bg-[#09090B] text-[#c1c1c7] border border-zinc-800"
								/>
								<button
									onClick={handleAddConfig}
									disabled={!selectedLabel || !selectedContract || !config}
									className="px-4 py-2 rounded-md bg-[#09090B] text-[#c1c1c7] hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
								>
									<FaPlus />
									Add
								</button>
							</div>
						</div>

						{configurations.length > 0 && (
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<h2 className="text-xl font-semibold text-slate-100">
											Display Configuration
										</h2>
										{isCommitted && (
											<div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-400/10 border border-green-400/20">
												<CheckCircle className="w-4 h-4 text-green-400" />
												<span className="text-xs font-medium text-green-400">
													Committed
												</span>
											</div>
										)}
									</div>
									<div className="flex items-center gap-2">
										<button
											onClick={() => setShowJson(!showJson)}
											className="px-4 py-2 text-sm bg-[#09090B] text-[#c1c1c7] rounded-md ring-zinc-700/50 flex items-center gap-2 hover:bg-zinc-700 transition-colors shadow-sm ring-1"
										>
											{showJson ? "Show Pretty" : "Show JSON"}
										</button>
									</div>
								</div>
								{showJson ? (
									<motion.div
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										className="font-mono"
									>
										<div className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800 overflow-x-auto">
											<ReactJson
												src={configurations}
												theme={{
													base00: "#09090B",
													base01: "#09090B",
													base02: "#09090B",
													base03: "#22C55D",
													base04: "#22C55D",
													base05: "#34D399",
													base06: "#22C55D",
													base07: "#ffffff",
													base08: "#22C55D",
													base09: "#22C55D",
													base0A: "#22C55D",
													base0B: "#22C55D",
													base0C: "#22C55D",
													base0D: "#22C55D",
													base0E: "#22C55D",
													base0F: "#22C55D",
												}}
												collapsed={false}
												enableClipboard={false}
												displayDataTypes={false}
												name={false}
											/>
										</div>
									</motion.div>
								) : (
									<motion.div
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										className="grid gap-3 w-full"
									>
										{configurations.map((config, index) => {
											const label = selectedRepo.labels.find(
												(l) => l.id === config.labelId,
											);
											const contract = deployedContracts.find(
												(c) => c.address === config.reward_contract,
											);
											return (
												<div
													key={index}
													className="group flex items-center justify-between p-4 w-full rounded-lg border border-zinc-800/50 bg-[#09090B] hover:border-green-400/20 transition-all duration-300"
												>
													<div className="flex items-center gap-8 w-full">
														<div className="px-3 py-1 ">
															<span className="text-xs font-mono text-green-400">
																CONFIG
															</span>
														</div>
														<div className="h-6 w-px bg-zinc-800/50" />
														<div className="flex flex-col gap-1 min-w-[120px]">
															<span className="text-xs text-zinc-500 font-medium">
																LABEL
															</span>
															<span className="text-sm font-mono">
																<span
																	style={{ background: `#${label?.color}` }}
																	className="w-2 h-2 rounded-full inline-block mr-1"
																/>
																{label?.name || "—"}
															</span>
														</div>
														<div className="flex flex-col gap-1 min-w-[180px]">
															<span className="text-xs text-zinc-500 font-medium">
																CONTRACT
															</span>
															<div className="flex items-center gap-2">
																<span className="text-sm text-green-400 font-mono">
																	{contract?.name || "UNKNOWN"}
																</span>
																<span className="text-xs text-zinc-500">
																	({contract?.symbol || "???"})
																</span>
															</div>
														</div>
														<div className="flex flex-col gap-1 flex-1">
															<span className="text-xs text-zinc-500 font-medium">
																REWARD CONFIG
															</span>
															<span className="text-sm text-zinc-200 font-mono">
																{config.reward_config}
															</span>
														</div>
													</div>
												</div>
											);
										})}
									</motion.div>
								)}
								<div className="mt-6 space-y-4">
									<div className="flex justify-end">
										<button
											onClick={handleCommitRepo}
											disabled={
												isCommitting || isCommitted || !configurations.length
											}
											className={`px-6 py-3 rounded-lg flex items-center gap-2 transition-all duration-200 ${
												isCommitted
													? "bg-green-400/10 text-green-400 border border-green-400/20 cursor-default"
													: "bg-[#09090B] text-[#c1c1c7] hover:bg-zinc-700 border border-zinc-800"
											} disabled:opacity-50 disabled:cursor-not-allowed`}
										>
											{isCommitting ? (
												<>
													<Loader2 className="w-4 h-4 animate-spin" />
													<span>Committing Configuration...</span>
												</>
											) : isCommitted ? (
												<>
													<CheckCircle className="w-4 h-4" />
													<span>Configuration Committed</span>
												</>
											) : (
												<>
													<FaRocket className="w-4 h-4" />
													<span>Commit Configuration</span>
												</>
											)}
										</button>
									</div>
									{commitTxHash && (
										<div className="flex items-center gap-2 justify-end">
											<span className="text-xs text-zinc-500">
												Transaction:
											</span>
											<a
												href={`https://neutron.celat.one/pion-1/txs/${commitTxHash}`}
												target="_blank"
												rel="noopener noreferrer"
												className="text-xs text-green-400 hover:text-green-300 transition-colors font-mono"
											>
												{commitTxHash.slice(0, 8)}...{commitTxHash.slice(-8)}
											</a>
										</div>
									)}
								</div>
							</div>
						)}
					</div>
				</div>
			</motion.div>
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="rounded-xl bg-[#0A0A0A] shadow-lg border border-zinc-800 p-6"
			>
				{configHistory.length > 0 && (
					<div className="space-y-6">
						<div className="flex items-center gap-2">
							<h2 className="text-xl font-semibold text-slate-100">
								Configuration History
							</h2>
						</div>

						<div className="space-y-4">
							{configHistory.map((historyItem, index) => (
								<motion.div
									key={index}
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									className="rounded-lg border border-zinc-800 bg-[#09090B] p-4"
								>
									<div className="flex items-center justify-between mb-4">
										<div className="flex items-center gap-2">
											<span className="text-sm text-zinc-500">
												{new Date(historyItem.timestamp).toLocaleDateString()}
											</span>
											<span className="text-zinc-700">•</span>
											<a
												href={`https://neutron.celat.one/pion-1/txs/${historyItem.txHash}`}
												target="_blank"
												rel="noopener noreferrer"
												className="text-sm text-green-400 hover:text-green-300 transition-colors font-mono"
											>
												{historyItem.txHash.slice(0, 8)}...
												{historyItem.txHash.slice(-8)}
											</a>
										</div>
									</div>

									<div className="grid gap-3">
										{historyItem.configurations.map((config, configIndex) => {
											const label = selectedRepo.labels.find(
												(l) => l.id === config.labelId,
											);
											const contract = deployedContracts.find(
												(c) => c.address === config.reward_contract,
											);

											return (
												<div
													key={configIndex}
													className="group flex items-center justify-between p-3 w-full rounded-lg border border-zinc-800/50 bg-[#0A0A0A]"
												>
													<div className="flex items-center gap-6 w-full">
														<div className="flex flex-col gap-1 min-w-[120px]">
															<span className="text-xs text-zinc-500 font-medium">
																LABEL
															</span>
															<span className="text-sm font-mono">
																<span
																	style={{
																		backgroundColor: `#${label?.color}`,
																	}}
																	className="w-2 h-2 rounded-full inline-block mr-1"
																/>
																{label?.name || "—"}
															</span>
														</div>
														<div className="flex flex-col gap-1 min-w-[180px]">
															<span className="text-xs text-zinc-500 font-medium">
																CONTRACT
															</span>
															<div className="flex items-center gap-2">
																<span className="text-sm text-green-400 font-mono">
																	{contract?.name || "UNKNOWN"}
																</span>
																<span className="text-xs text-zinc-500">
																	({contract?.symbol || "???"})
																</span>
															</div>
														</div>
														<div className="flex flex-col gap-1 flex-1">
															<span className="text-xs text-zinc-500 font-medium">
																CONFIG
															</span>
															<span className="text-sm text-zinc-200 font-mono">
																{config.reward_config}
															</span>
														</div>
													</div>
												</div>
											);
										})}
									</div>
								</motion.div>
							))}
						</div>
					</div>
				)}
			</motion.div>
		</div>
	);
};
