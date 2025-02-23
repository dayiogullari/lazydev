"use client";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { signIn, signOut } from "next-auth/react";
import { FaGithub, FaCoins, FaSignOutAlt, FaWallet } from "react-icons/fa";
import { Session } from "next-auth";
import { Dispatch, SetStateAction, useState } from "react";
import { useClickOutside } from "@mantine/hooks";
import { useKeplrWallet } from "@/providers/keplerContext";
import {
	Loader2,
	Terminal,
	Shield,
	Trophy,
	GitFork,
	LogOut,
} from "lucide-react";

interface Props {
	session: Session | null;
	activeTab: string;
	setActiveTab: Dispatch<SetStateAction<string>>;
	totalCoins: number;
}

const tabs = [
	{
		id: "dashboard",
		label: "Dashboard",
		icon: <Terminal className="w-4 h-4" />,
	},
	{
		id: "leaderboard",
		label: "Leaderboard",
		icon: <Trophy className="w-4 h-4" />,
	},
	{
		id: "achievements",
		label: "Achievements",
		icon: <Shield className="w-4 h-4" />,
	},
	{
		id: "manage-repos",
		label: "Manage Repos",
		icon: <GitFork className="w-4 h-4" />,
	},
];

export function NavBar({
	session,
	activeTab,
	setActiveTab,
	totalCoins,
}: Props) {
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const ref = useClickOutside(() => setIsDropdownOpen(false));
	const [isLoading, setIsLoading] = useState(false);
	const { keplrWalletAddress, connectKeplrWallet, disconnectKeplrWallet } =
		useKeplrWallet();

	const ConnectGithub = async () => {
		setIsLoading(true);
		try {
			signIn("github");
		} catch (error) {
			console.error("GitHub authentication error:", error);
		}
	};

	return (
		<header className="fixed w-full top-0 z-50">
			<div className="absolute inset-0 bg-[#0A0A0A] backdrop-blur-md border-b border-zinc-800/50" />

			<div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-emerald-500/0 via-emerald-500/70 to-emerald-500/0">
				<motion.div className="w-full h-px bg-gradient-to-r from-emerald-500/0 via-emerald-500/20 to-emerald-500/0" />
			</div>

			<nav className="relative max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
				<div className="flex items-center gap-8">
					<motion.div className="text-2xl font-bold relative">
						<span className="bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 bg-clip-text text-transparent">
							LazyDev_
						</span>
					</motion.div>

					{session && (
						<div className="hidden md:flex items-center gap-1">
							{tabs.map((tab) => (
								<motion.button
									key={tab.id}
									onClick={() => setActiveTab(tab.id)}
									className="relative px-4 py-2 group"
									whileTap={{ scale: 0.95 }}
								>
									<div
										className={`absolute inset-0 rounded-md transition-colors duration-200 ${
											activeTab === tab.id
												? "bg-emerald-500/10"
												: "group-hover:bg-emerald-500/5"
										}`}
									/>

									<div className="relative flex items-center gap-2">
										<span
											className={`transition-colors duration-200 ${
												activeTab === tab.id
													? "text-emerald-400"
													: "text-zinc-400 group-hover:text-emerald-300"
											}`}
										>
											{tab.icon}
										</span>
										<span
											className={`text-sm font-medium transition-colors duration-200 ${
												activeTab === tab.id
													? "text-emerald-400"
													: "text-zinc-400 group-hover:text-emerald-300"
											}`}
										>
											{tab.label}
										</span>
									</div>
								</motion.button>
							))}
						</div>
					)}
				</div>

				<div className="flex items-center gap-4">
					{session ? (
						<>
							<motion.div className="flex items-center rounded-lg gap-3 relative z-10 border px-4 py-2  overflow-hidden border-zinc-800">
								<FaCoins className="text-emerald-400 relative z-10" />
								<span className="font-medium text-emerald-400 relative z-10">
									{totalCoins.toLocaleString()}
								</span>
							</motion.div>

							{keplrWalletAddress ? (
								<div className="flex items-center rounded-lg gap-3 relative z-10 border px-4 py-2  overflow-hidden border-zinc-800">
									<FaWallet className="text-emerald-400" />
									<span className="text-sm text-zinc-300">
										{keplrWalletAddress.slice(0, 6)}...
										{keplrWalletAddress.slice(-4)}
									</span>
									<button
										onClick={disconnectKeplrWallet}
										className="text-sm text-red-400 hover:text-red-300 transition-colors"
									>
										<LogOut className="size-4" />
									</button>
								</div>
							) : (
								<button
									onClick={() => connectKeplrWallet()}
									className="flex items-center gap-3 text-emerald-400 hover:text-emerald-300 rounded-lg border border-zinc-800 px-4 py-2 relative overflow-hidden"
								>
									<FaWallet />
									<span>Connect Wallet</span>
								</button>
							)}

							<div className="relative" ref={ref}>
								<motion.button
									onClick={() => setIsDropdownOpen(!isDropdownOpen)}
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									className="relative"
								>
									<div className="p-0.5 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600">
										<div className="rounded-full p-0.5 bg-zinc-900">
											<Image
												src={session.user?.image || "/placeholder-user.jpg"}
												alt="Profile"
												width={32}
												height={32}
												className="rounded-full"
											/>
										</div>
									</div>
								</motion.button>

								<AnimatePresence>
									{isDropdownOpen && (
										<motion.div
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: 10 }}
											transition={{ duration: 0.2 }}
											className="absolute right-0 mt-2 w-64 origin-top-right rounded-lg bg-zinc-900 border border-zinc-800 shadow-xl overflow-hidden"
										>
											<div className="p-4 border-b border-zinc-800">
												<div className="flex items-center gap-3">
													<Image
														src={session.user?.image || "/placeholder-user.jpg"}
														alt="Profile"
														width={40}
														height={40}
														className="rounded-full"
													/>
													<div>
														<p className="text-sm font-medium text-zinc-200">
															{session.user?.name}
														</p>
														<p className="text-xs text-zinc-400">
															{session.user?.email}
														</p>
													</div>
												</div>
											</div>

											<div className="p-2">
												<motion.button
													whileHover={{ scale: 1.02 }}
													whileTap={{ scale: 0.98 }}
													onClick={() => {
														signOut({ callbackUrl: "/" });
														setIsDropdownOpen(false);
													}}
													className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
												>
													<FaSignOutAlt />
													Sign Out
												</motion.button>
											</div>
										</motion.div>
									)}
								</AnimatePresence>
							</div>
						</>
					) : (
						<motion.button
							onClick={() => ConnectGithub()}
							disabled={isLoading}
							className="flex items-center gap-3 text-emerald-400 hover:text-emerald-300 rounded-lg border border-zinc-800 px-4 py-2 relative overflow-hidden"
						>
							<div className="relative flex items-center gap-2">
								{isLoading ? (
									<>
										<Loader2 className="animate-spin" />
										<span>Connecting...</span>
									</>
								) : (
									<>
										<FaGithub />
										<span>Connect GitHub</span>
									</>
								)}
							</div>
						</motion.button>
					)}
				</div>
			</nav>
		</header>
	);
}
