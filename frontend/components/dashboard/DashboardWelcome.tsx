import React from "react";
import { GitPullRequest, Plus, AlertCircle } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";

interface DashboardWelcomeProps {
	isAuthenticated: boolean;
	hasContributions: boolean;
}

const DashboardWelcome: React.FC<DashboardWelcomeProps> = ({
	isAuthenticated,
	hasContributions,
}) => {
	const [activeTab, setActiveTab] = React.useState("developers");

	if (!isAuthenticated) {
		return (
			<div className="flex flex-col items-center justify-center space-y-6 py-16 px-4">
				<div className="h-16 w-16 bg-zinc-800 rounded-full flex items-center justify-center mb-2">
					<GitPullRequest className="w-8 h-8 text-zinc-300" />
				</div>

				<div className="flex gap-2 p-1 bg-[#1B1B1D] bg-opacity-90 rounded-lg">
					<button
						onClick={() => setActiveTab("developers")}
						className={`px-4 py-2 rounded-md transition-all ${
							activeTab === "developers"
								? "bg-zinc-800 text-emerald-400"
								: "text-zinc-400 hover:text-zinc-200"
						}`}
					>
						For Developers
					</button>
					<button
						onClick={() => setActiveTab("organizations")}
						className={`px-4 py-2 rounded-md transition-all ${
							activeTab === "organizations"
								? "bg-zinc-800 text-emerald-400"
								: "text-zinc-400 hover:text-zinc-200"
						}`}
					>
						For Organizations
					</button>
				</div>

				{activeTab === "developers" && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="text-center space-y-4 max-w-lg"
					>
						<h2 className="text-2xl font-bold text-white">
							Welcome to ContributionRewards
						</h2>
						<p className="text-zinc-400 text-lg">
							Turn your open source contributions into rewards. Connect your
							GitHub account to start tracking your pull requests and earning
							$GYATT tokens.
						</p>

						<div className="flex justify-center pt-4">
							<motion.button
								onClick={() => signIn("github")}
								className="flex items-center gap-3 text-emerald-400 hover:text-emerald-300 rounded-lg border border-zinc-800 px-4 py-2 relative overflow-hidden"
							>
								<div className="relative flex items-center gap-2">
									<FaGithub />
									<span>Connect GitHub</span>
								</div>
							</motion.button>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 w-full">
							<div className="bg-[#1B1B1D] bg-opacity-90 p-6 rounded-lg text-center">
								<h3 className="text-white font-semibold mb-2">Track PRs</h3>
								<p className="text-zinc-400 text-sm">
									Automatically monitor your open source contributions
								</p>
							</div>
							<div className="bg-[#1B1B1D] bg-opacity-90 p-6 rounded-lg text-center">
								<h3 className="text-white font-semibold mb-2">Earn Tokens</h3>
								<p className="text-zinc-400 text-sm">
									Get $GYATT rewards for merged pull requests
								</p>
							</div>
							<div className="bg-[#1B1B1D] bg-opacity-90 p-6 rounded-lg text-center">
								<h3 className="text-white font-semibold mb-2">Build Rep</h3>
								<p className="text-zinc-400 text-sm">
									Grow your on-chain developer reputation
								</p>
							</div>
						</div>
					</motion.div>
				)}

				{activeTab === "organizations" && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="text-center space-y-4 max-w-lg"
					>
						<h2 className="text-2xl font-bold text-white">
							Reward Your Contributors
						</h2>
						<p className="text-zinc-400 text-lg">
							Incentivize developers to contribute to your open source projects
							by offering $GYATT token rewards for quality pull requests.
						</p>

						<div className="flex justify-center pt-4">
							<motion.button
								onClick={() => signIn("github")}
								className="flex items-center gap-3 text-emerald-400 hover:text-emerald-300 rounded-lg border border-zinc-800 px-4 py-2 relative overflow-hidden"
							>
								<div className="relative flex items-center gap-2">
									<FaGithub />
									<span>Connect GitHub</span>
								</div>
							</motion.button>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 w-full ">
							<div className="bg-[#1B1B1D] bg-opacity-90 p-6  rounded-lg text-center">
								<h3 className="text-white font-semibold mb-2">Set Rewards</h3>
								<p className="text-zinc-400 text-sm">
									Define token rewards for different contribution types
								</p>
							</div>
							<div className="bg-[#1B1B1D] bg-opacity-90 p-6  rounded-lg text-center">
								<h3 className="text-white font-semibold mb-2">
									Attract Talent
								</h3>
								<p className="text-zinc-400 text-sm">
									Build a community of skilled contributors
								</p>
							</div>
							<div className="bg-[#1B1B1D] bg-opacity-90 p-6  rounded-lg text-center">
								<h3 className="text-white font-semibold mb-2">Track Impact</h3>
								<p className="text-zinc-400 text-sm">
									Monitor contribution metrics and token distribution
								</p>
							</div>
						</div>
					</motion.div>
				)}
			</div>
		);
	}

	if (isAuthenticated && !hasContributions) {
		return (
			<div className="flex flex-col items-center justify-center space-y-6 pt-4 px-4">
				<div className="h-16 w-16 bg-zinc-800 rounded-full flex items-center justify-center mb-2">
					<AlertCircle className="w-8 h-8 text-emerald-400" />
				</div>

				<div className="text-center space-y-4 max-w-lg">
					<h2 className="text-2xl font-bold text-white">
						No Contributions Yet
					</h2>
					<p className="text-zinc-400 text-lg">
						Start contributing to open source projects to earn rewards. Your
						contributions will appear here once you make your first pull
						request.
					</p>

					<div className="flex justify-center pt-4">
						<a
							href="https://github.com/topics/good-first-issue"
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center gap-3 text-emerald-400 hover:text-emerald-300 rounded-lg border border-zinc-800 px-4 py-2"
						>
							<Plus className="w-5 h-5" />
							<span>Find First Issues</span>
						</a>
					</div>

					<div className="mt-8 bg-[#1B1B1D] bg-opacity-90 p-6 rounded-lg">
						<h3 className="text-white font-semibold mb-4">Quick Start Guide</h3>
						<ul className="text-left text-zinc-400 space-y-3">
							<li>1. Find an open source project youd like to contribute to</li>
							<li>
								2. Look for issues labeled good first issue or help wanted
							</li>
							<li>3. Fork the repository and create your pull request</li>
							<li>4. Once merged, your contribution will appear here</li>
						</ul>
					</div>
				</div>
			</div>
		);
	}

	return null;
};

export default DashboardWelcome;
