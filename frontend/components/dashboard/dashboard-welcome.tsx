import React from "react";
import { GitPullRequest, GitMerge, Shield, Code, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";

interface DashboardWelcomeProps {
	hasContributions: boolean;
}

const DashboardWelcome: React.FC<DashboardWelcomeProps> = ({}) => {
	const [activeTab, setActiveTab] = React.useState("developers");
	const { status } = useSession();

	if (status != "authenticated") {
		return (
			<div className="flex flex-col items-center justify-center space-y-6 py-12 px-4">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="text-center space-y-4 max-w-3xl mb-8"
				>
					<div className="flex items-center justify-center gap-3 mb-6">
						<Code className="w-10 h-10 text-emerald-400" />
						<h1 className="text-4xl font-bold text-white">LazyDev_</h1>
					</div>
					<h2 className="text-2xl font-medium text-emerald-400">
						Get Paid For Your Open Source Contributions
					</h2>
					<p className="text-zinc-300 text-lg mx-auto max-w-2xl">
						The first decentralized platform that verifiably rewards developers
						for their open source work using zkTLS technology
					</p>

					<div className="flex justify-center pt-4">
						<p className="text-zinc-400 text-sm bg-zinc-800 px-4 py-2 rounded-full">
							Connect your GitHub account using the button in the navbar
						</p>
					</div>
				</motion.div>

				<div className="flex gap-2 p-1 bg-[#1B1B1D] bg-opacity-90 rounded-lg mb-8">
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
						For Project Owners
					</button>
				</div>

				{activeTab === "developers" && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl"
					>
						<div className="space-y-4">
							<h3 className="text-xl font-semibold text-white flex items-center gap-2">
								<GitPullRequest className="w-5 h-5 text-emerald-400" />
								How It Works
							</h3>
							<div className="bg-[#1B1B1D] bg-opacity-90 p-6 rounded-lg space-y-4">
								<div className="flex items-start gap-3">
									<div className="w-6 h-6 rounded-full bg-emerald-400 flex items-center justify-center text-black font-bold">
										1
									</div>
									<div>
										<h4 className="text-white font-medium">Contribute</h4>
										<p className="text-zinc-400 text-sm">
											Submit pull requests to registered repositories
										</p>
									</div>
								</div>
								<div className="flex items-start gap-3">
									<div className="w-6 h-6 rounded-full bg-emerald-400 flex items-center justify-center text-black font-bold">
										2
									</div>
									<div>
										<h4 className="text-white font-medium">Verify</h4>
										<p className="text-zinc-400 text-sm">
											Your PR is cryptographically verified using zkTLS proofs
										</p>
									</div>
								</div>
								<div className="flex items-start gap-3">
									<div className="w-6 h-6 rounded-full bg-emerald-400 flex items-center justify-center text-black font-bold">
										3
									</div>
									<div>
										<h4 className="text-white font-medium">Get Rewarded</h4>
										<p className="text-zinc-400 text-sm">
											Automatically receive tokens, NFTs or other rewards
										</p>
									</div>
								</div>
							</div>
						</div>

						<div className="space-y-4">
							<h3 className="text-xl font-semibold text-white flex items-center gap-2">
								<Shield className="w-5 h-5 text-emerald-400" />
								Developer Benefits
							</h3>
							<div className="bg-[#1B1B1D] bg-opacity-90 p-6 rounded-lg">
								<ul className="space-y-4">
									<li className="flex items-start gap-3">
										<Zap className="w-5 h-5 text-emerald-400 mt-1" />
										<div>
											<h4 className="text-white font-medium">
												Get Paid for Your Work
											</h4>
											<p className="text-zinc-400 text-sm">
												Turn your passion for open source into income
											</p>
										</div>
									</li>
									<li className="flex items-start gap-3">
										<Shield className="w-5 h-5 text-emerald-400 mt-1" />
										<div>
											<h4 className="text-white font-medium">
												Verifiable Reputation
											</h4>
											<p className="text-zinc-400 text-sm">
												Build on-chain proof of your development skills
											</p>
										</div>
									</li>
									<li className="flex items-start gap-3">
										<GitMerge className="w-5 h-5 text-emerald-400 mt-1" />
										<div>
											<h4 className="text-white font-medium">
												Automatic Rewards
											</h4>
											<p className="text-zinc-400 text-sm">
												No more chasing payments or dealing with paperwork
											</p>
										</div>
									</li>
								</ul>
							</div>
						</div>
					</motion.div>
				)}

				{activeTab === "organizations" && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl"
					>
						<div className="space-y-4 h-full">
							<h3 className="text-xl font-semibold text-white flex items-center gap-2">
								<GitPullRequest className="w-5 h-5 text-emerald-400" />
								Setting Up Your Project
							</h3>
							<div className="bg-[#1B1B1D] bg-opacity-90 p-6 rounded-lg space-y-4 h-[calc(100%-40px)]">
								<ul className="space-y-4">
									<li className="flex items-start gap-3">
										<div className="w-6 h-6 rounded-full bg-emerald-400 flex items-center justify-center text-black font-bold">
											1
										</div>
										<div>
											<h4 className="text-white font-medium">
												Register Repository
											</h4>
											<p className="text-zinc-400 text-sm">
												Securely link your GitHub repo using zkTLS verification
											</p>
										</div>
									</li>
									<li className="flex items-start gap-3">
										<div className="w-6 h-6 rounded-full bg-emerald-400 flex items-center justify-center text-black font-bold">
											2
										</div>
										<div>
											<h4 className="text-white font-medium">Define Rewards</h4>
											<p className="text-zinc-400 text-sm">
												Set up custom rewards tied to PR labels
											</p>
										</div>
									</li>
									<li className="flex items-start gap-3">
										<div className="w-6 h-6 rounded-full bg-emerald-400 flex items-center justify-center text-black font-bold">
											3
										</div>
										<div>
											<h4 className="text-white font-medium">Watch It Work</h4>
											<p className="text-zinc-400 text-sm">
												LazyDev_ handles verification and rewards distribution
											</p>
										</div>
									</li>
								</ul>
							</div>
						</div>

						<div className="space-y-4 h-full">
							<h3 className="text-xl font-semibold text-white flex items-center gap-2">
								<Shield className="w-5 h-5 text-emerald-400" />
								Project Owner Benefits
							</h3>
							<div className="bg-[#1B1B1D] bg-opacity-90 p-6 rounded-lg space-y-4 h-[calc(100%-40px)]">
								<ul className="space-y-4">
									<li className="flex items-start gap-3">
										<Zap className="w-5 h-5 text-emerald-400 mt-1" />
										<div>
											<h4 className="text-white font-medium">
												Attract More Contributors
											</h4>
											<p className="text-zinc-400 text-sm">
												Incentivize developers to work on your open source
												project
											</p>
										</div>
									</li>
									<li className="flex items-start gap-3">
										<Shield className="w-5 h-5 text-emerald-400 mt-1" />
										<div>
											<h4 className="text-white font-medium">
												Security & Transparency
											</h4>
											<p className="text-zinc-400 text-sm">
												Cryptographic proof of GitHub data using zkTLS
												technology
											</p>
										</div>
									</li>
									<li className="flex items-start gap-3">
										<GitMerge className="w-5 h-5 text-emerald-400 mt-1" />
										<div>
											<h4 className="text-white font-medium">
												Permissionless & Automated
											</h4>
											<p className="text-zinc-400 text-sm">
												No middlemen or manual processes to slow things down
											</p>
										</div>
									</li>
								</ul>
							</div>
						</div>
					</motion.div>
				)}

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
					className="mt-8 w-full max-w-4xl"
				>
					<div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg">
						<h3 className="text-xl font-semibold text-white mb-4">
							How zkTLS Technology Makes This Possible
						</h3>
						<p className="text-zinc-400 mb-4">
							LazyDev_ uses zkTLS technology to bridge GitHub data to
							blockchain, creating cryptographic proofs of pull requests and
							user identities that can be verified on-chain.
						</p>
						<div className="flex flex-col md:flex-row gap-4">
							<div className="bg-[#1B1B1D] p-4 rounded-lg flex-1">
								<h4 className="text-white font-medium mb-2">
									User Verification
								</h4>
								<p className="text-zinc-500 text-sm">
									Secure commit/reveal scheme prevents frontrunning of user
									identity proofs
								</p>
							</div>
							<div className="bg-[#1B1B1D] p-4 rounded-lg flex-1">
								<h4 className="text-white font-medium mb-2">PR Verification</h4>
								<p className="text-zinc-500 text-sm">
									On-chain verification of GitHub pull request data
								</p>
							</div>
							<div className="bg-[#1B1B1D] p-4 rounded-lg flex-1">
								<h4 className="text-white font-medium mb-2">Admin Proof</h4>
								<p className="text-zinc-500 text-sm">
									Repository admins verified to ensure secure project
									registration
								</p>
							</div>
						</div>
					</div>
				</motion.div>
			</div>
		);
	}

	return (
		<div className="flex flex-col items-center justify-center space-y-6 pt-8 px-4">
			<div className="h-16 w-16 bg-zinc-800 rounded-full flex items-center justify-center mb-2">
				<Code className="w-8 h-8 text-emerald-400" />
			</div>

			<div className="text-center space-y-4 max-w-xl">
				<h2 className="text-2xl font-bold text-white">Welcome to LazyDev_</h2>
				<p className="text-zinc-400 text-lg">
					Youre ready to start earning rewards for your open source
					contributions. Find projects using LazyDev _ to begin your journey.
				</p>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
					<a
						href="https://github.com/topics/good-first-issue"
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center justify-center gap-3 text-emerald-400 hover:text-emerald-300 rounded-lg border border-zinc-800 px-4 py-3"
					>
						<GitPullRequest className="w-5 h-5" />
						<span>Find Projects</span>
					</a>
					<a
						href="#dashboard"
						className="flex items-center justify-center gap-3 text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg px-4 py-3"
					>
						<Zap className="w-5 h-5" />
						<span>View Dashboard</span>
					</a>
				</div>

				<div className="mt-8 bg-[#1B1B1D] bg-opacity-90 p-6 rounded-lg">
					<h3 className="text-white font-semibold mb-4">Getting Started</h3>
					<ul className="text-left text-zinc-400 space-y-3">
						<li className="flex items-start gap-3">
							<div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 font-bold text-sm">
								1
							</div>
							<span>
								Browse repositories that use LazyDev _ for contributor rewards
							</span>
						</li>
						<li className="flex items-start gap-3">
							<div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 font-bold text-sm">
								2
							</div>
							<span>
								Submit pull requests to these projects focusing on labeled
								issues
							</span>
						</li>
						<li className="flex items-start gap-3">
							<div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 font-bold text-sm">
								3
							</div>
							<span>Once your PR is merged, verify it through LazyDev _</span>
						</li>
						<li className="flex items-start gap-3">
							<div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 font-bold text-sm">
								4
							</div>
							<span>
								Receive your rewards automatically based on the PR labels
							</span>
						</li>
					</ul>
				</div>
			</div>
		</div>
	);
};

export default DashboardWelcome;
