"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

import ChallengesTab from "@/components/ChallengesTab";
import LazydevInteraction from "@/components/lazyDevFlow/LazydevInteraction";
import { NavBar } from "@/components/ui/NavBar";
import { DashboardTab } from "@/components/dashboard/DashboardTab";
import { LeaderboardTab } from "@/components/dashboard/LeaderboardTab";
import AchievementsTab from "@/components/AchievmentsTab";
import { ProfileTab } from "@/components/profile/ProfileTab";
import { Footer } from "@/components/ui/Footer";
import { ManageReposTab } from "@/components/manageRepos/manageRepos";
import { getGithubContributions } from "@/utils/github-contributions";

interface Contribution {
	repo: string;
	prUrl: string;
	date: string;
	description: string;
	status?: string;
	points?: number;
	proof?: string;
}

export default function Home() {
	const { data: session, status } = useSession();
	const [contributions, setContributions] = useState<Contribution[]>([]);
	const [loadingContributions, setLoadingContributions] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState("dashboard");
	const [totalCoins, setTotalCoins] = useState(0);

	const mockLeaderboard = [
		{
			rank: 1,
			fullUsername: "developer123",
			displayUsername: "Dev****23",
			points: 1200,
			badges: 3,
		},
		{
			rank: 2,
			fullUsername: "codemaster45",
			displayUsername: "Cod***er45",
			points: 900,
			badges: 2,
		},
		{
			rank: 3,
			fullUsername: "zkWizard99",
			displayUsername: "zkW***99",
			points: 750,
			badges: 1,
		},
	];

	useEffect(() => {
		if (status === "authenticated" && session?.user?.email) {
			fetchContributions();
		}
	}, [status, session?.user?.email]);

	const [visitedTabs, setVisitedTabs] = useState<Set<string>>(
		new Set([activeTab]),
	);

	useEffect(() => {
		setVisitedTabs((prev) => new Set([...prev, activeTab]));
	}, [activeTab]);

	const fetchContributions = async () => {
		if (!session?.user?.githubUsername || !session?.accessToken) return;

		setLoadingContributions(true);
		setError(null);

		try {
			const fetchedContributions = await getGithubContributions(
				session.user.githubUsername,
			);

			setContributions(fetchedContributions);
			setTotalCoins(123);

			toast.success("Contributions loaded!");
		} catch (err: unknown) {
			const errorMessage = err instanceof Error ? err.message : String(err);
			setError(errorMessage);
			toast.error("Failed to load contributions.");
			console.error("Error fetching contributions:", err);
		} finally {
			setLoadingContributions(false);
		}
	};

	return (
		<div className="min-h-screen pt-12 text-slate-100 flex flex-col relative">
			<NavBar
				session={session}
				activeTab={activeTab}
				setActiveTab={setActiveTab}
				totalCoins={totalCoins}
			/>

			<div className="max-w-7xl mx-auto w-full px-4 mt-8">
				<LazydevInteraction
					rpcUrl="https://rpc.pion.rs-testnet.polypore.xyz"
					contractAddress="neutron17763lnw3wp74zg8etdpultvj2sysx2qrsv0hwrjay3dwyyd9uqyqhcxr86"
				/>
			</div>

			<main className="flex-grow max-w-7xl mx-auto w-full px-4 py-8">
				{Array.from(visitedTabs).map((tab) => (
					<div key={tab} className={activeTab !== tab ? "hidden" : ""}>
						<AnimatePresence mode="wait">
							{activeTab === tab && (
								<motion.div
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -10 }}
									transition={{ duration: 0.2 }}
								>
									{tab === "dashboard" && (
										<DashboardTab
											rpcUrl="https://rpc.pion.rs-testnet.polypore.xyz"
											contractAddress="neutron17763lnw3wp74zg8etdpultvj2sysx2qrsv0hwrjay3dwyyd9uqyqhcxr86"
											contributions={contributions}
											loadingContributions={loadingContributions}
											error={error}
											totalCoins={totalCoins}
											fetchContributions={fetchContributions}
										/>
									)}

									{tab === "leaderboard" && (
										<LeaderboardTab mockLeaderboard={mockLeaderboard} />
									)}

									{tab === "achievements" && <AchievementsTab />}
									{tab === "challenges" && <ChallengesTab />}
									{tab === "profile" && <ProfileTab session={session} />}
									{tab === "manage-repos" && <ManageReposTab />}
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				))}
			</main>

			<Footer />
		</div>
	);
}
