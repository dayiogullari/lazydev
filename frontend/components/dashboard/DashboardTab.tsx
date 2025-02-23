"use client";
// import ContributionChart from "@/components/ContributionChart";
import { useState } from "react";
import { useKeplrWallet } from "@/providers/keplerContext";

import { claimReward } from "@/utils/claim-reward-helper";

import { ContributionCard } from "../contribution/ContributionCard";
import { StatsCard } from "./StatsCard";
import {
	Award,
	GitPullRequest,
	Loader2,
	RefreshCw,
	TrendingUp,
} from "lucide-react";
import DashboardWelcome from "./DashboardWelcome";
import { useSession } from "next-auth/react";

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
	totalCoins,
	contractAddress,
	rpcUrl,
	fetchContributions,
}: Props) {
	const { keplrWalletAddress } = useKeplrWallet();
	const [claimingPrUrl, setClaimingPrUrl] = useState<string | null>(null);
	const [txHashes, setTxHashes] = useState<Record<string, string>>({});
	const [claimedPrs, setClaimedPrs] = useState<Set<string>>(new Set());
	const [invalidRepos, setInvalidRepos] = useState<Set<string>>(new Set());
	const { data: session } = useSession();

	const isAuthenticated = !!session?.accessToken;
	const hasContributions = contributions.length > 0;

	// const handleClaimAll = async () => {
	//   await claimAllRewards({
	//     keplrWalletAddress,
	//     contributions,
	//     claimedPrs,
	//     setClaimedPrs,
	//     invalidRepos,
	//     setInvalidRepos,
	//     setTxHashes,
	//     contractAddress,
	//     rpcUrl,
	//     setIsClaimingAll,
	//   });
	// };

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
		});
	};

	if (!isAuthenticated || (!hasContributions && !loadingContributions)) {
		return (
			<DashboardWelcome
				isAuthenticated={isAuthenticated}
				hasContributions={hasContributions}
			/>
		);
	}

	if (loadingContributions) {
		return (
			<div className="flex items-center justify-center h-64">
				<Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
			</div>
		);
	}

	return (
		<div className="space-y-8">
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				<StatsCard
					title="Total Coins"
					value={`${totalCoins.toLocaleString()} $GYATT`}
					icon={<TrendingUp className="w-6 h-6" />}
					trend="12.5%"
					trendUp={true}
				/>
				<StatsCard
					title="Global Rank"
					value="#8"
					icon={<Award className="w-6 h-6" />}
					trend="Top 1%"
					trendUp={true}
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
			</div>
		</div>
	);
}
