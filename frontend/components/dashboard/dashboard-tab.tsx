"use client";
import { useState } from "react";
import { useKeplrWallet } from "@/providers/kepler-context";
import { claimReward } from "@/utils/claim-reward-helper";
import { ContributionCard } from "../contribution/contribution-card";
import { StatsCard } from "./stats-card";
import {
	GitPullRequest,
	Loader2,
	RefreshCw,
	DollarSign,
	Coins,
} from "lucide-react";
import DashboardWelcome from "./dashboard-welcome";
import { useWindowSize } from "react-use";
import Confetti from "react-confetti";

interface Contribution {
	repo: string;
	prUrl: string;
	date: string;
	description: string;
	status?: string;
	points?: number;
	proof?: string;
}

interface Props {
	contributions: Contribution[];
	loadingContributions: boolean;
	error: string | null;
	totalCoins: number;
	secret?: string;
	githubToken?: string;
	contractAddress: string;
	rpcUrl: string;
	fetchContributions: () => void;
}

export function DashboardTab({
	contributions,
	loadingContributions,
	contractAddress,
	rpcUrl,
	fetchContributions,
}: Props) {
	const { keplrWalletAddress } = useKeplrWallet();
	const [claimingPrUrl, setClaimingPrUrl] = useState<string | null>(null);
	const [txHashes, setTxHashes] = useState<Record<string, string>>({});
	const [claimedPrs, setClaimedPrs] = useState<Set<string>>(new Set());
	const [successfullClaim, setSuccessfullClaim] = useState<boolean>(false);
	const [invalidRepos, setInvalidRepos] = useState<Set<string>>(new Set());
	const { width, height } = useWindowSize();
	const hasContributions = contributions.length > 0;

	const handleClaimReward = async (contribution: Contribution) => {
		await claimReward({
			keplrWalletAddress,
			setClaimingPrUrl,
			setTxHashes,
			setClaimedPrs,
			setInvalidRepos,
			contribution,
			contractAddress,
			rpcUrl,
			setSuccessfullClaim,
		});
	};

	if (loadingContributions) {
		return (
			<div className="flex items-center justify-center h-64">
				<Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
			</div>
		);
	}

	if (!hasContributions && !loadingContributions) {
		return <DashboardWelcome hasContributions={hasContributions} />;
	}

	return (
		<div className="space-y-8">
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				<StatsCard
					title="Portfolio Value"
					icon={<DollarSign className="w-6 h-6" />}
					isTokenCard={true}
					keplrWalletAddress={keplrWalletAddress}
					isUsdValue={true}
				/>

				<StatsCard
					title="GYATT Tokens"
					icon={<Coins className="w-6 h-6" />}
					isTokenCard={true}
					keplrWalletAddress={keplrWalletAddress}
					tokenSymbol="GYATT"
				/>

				<StatsCard
					title="Pull Requests"
					value={contributions.length}
					icon={<GitPullRequest className="w-6 h-6" />}
					trend="3 this week"
					trendUp={true}
				/>
			</div>

			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<h2 className="text-xl font-semibold text-white">
						Recent Contributions
					</h2>
					<button
						onClick={fetchContributions}
						className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-2"
					>
						Refresh Data
						<RefreshCw className="w-4 h-4" />
					</button>
				</div>

				<div className="space-y-4">
					{contributions.map((contribution) => (
						<ContributionCard
							key={contribution.prUrl}
							contribution={contribution}
							onClaim={handleClaimReward}
							isClaiming={claimingPrUrl === contribution.prUrl}
							txHash={txHashes[contribution.prUrl]}
							errorState={{
								isAlreadyClaimed: claimedPrs.has(contribution.prUrl),
								isInvalidRepo: invalidRepos.has(contribution.prUrl),
							}}
						/>
					))}
				</div>
				{successfullClaim && (
					<Confetti
						width={width}
						height={height}
						recycle={false}
						numberOfPieces={200}
					/>
				)}
			</div>
		</div>
	);
}
