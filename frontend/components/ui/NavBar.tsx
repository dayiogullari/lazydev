"use client";
import { Dispatch, SetStateAction, useState } from "react";

import { useClickOutside } from "@mantine/hooks";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { signIn, signOut } from "next-auth/react";
import { FaGithub, FaCoins, FaSignOutAlt, FaWallet } from "react-icons/fa";
import { Session } from "next-auth";
import {
	Loader2,
	Terminal,
	Shield,
	Trophy,
	GitFork,
	LogOut,
	ChevronDown,
	DollarSign,
	AlertCircle,
	CheckCircle,
} from "lucide-react";
import Logo from "@/asssets/logo";
import { useKeplrWallet } from "@/providers/kepler-context";
import {
	useTokenBalances,
	formatUsdValue,
	formatTokenAmount,
} from "@/utils/balance-fetch";

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

export function NavBar({ session, activeTab, setActiveTab }: Props) {
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [isTokensDropdownOpen, setIsTokensDropdownOpen] = useState(false);
	const userDropdownRef = useClickOutside(() => setIsDropdownOpen(false));
	const tokensDropdownRef = useClickOutside(() =>
		setIsTokensDropdownOpen(false),
	);
	const [isLoading, setIsLoading] = useState(false);
	const { keplrWalletAddress, connectKeplrWallet, disconnectKeplrWallet } =
		useKeplrWallet();

	const {
		balances,
		totalUsdValue,
		totalChange24h,
		isLoading: isLoadingTokens,
		error: tokenError,
		refreshBalances,
	} = useTokenBalances(keplrWalletAddress, 30000);

	const ConnectGithub = async () => {
		setIsLoading(true);
		try {
			signIn("github");
		} catch (error) {
			console.error("GitHub authentication error:", error);
		}
	};

	const isBothConnected = session && keplrWalletAddress;

	return (
		<header className="fixed w-full top-0 z-50">
			<div className="absolute inset-0 bg-[#0A0A0A]/90 backdrop-blur-lg border-b border-zinc-800/50" />

			<div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-emerald-500/0 via-emerald-500/70 to-emerald-500/0">
				<div className="w-full h-px bg-gradient-to-r from-emerald-500/0 via-emerald-500/20 to-emerald-500/0" />
			</div>

			<nav className="relative max-w-screen-2xl mx-auto px-2 sm:px-4 lg:px-6 h-16 flex items-center justify-between">
				<div className="flex items-center gap-2 sm:gap-4">
					<motion.div
						className="w-20 sm:w-28 lg:w-32"
						transition={{ type: "spring", stiffness: 400, damping: 10 }}
					>
						<Logo className="w-full h-auto" />
					</motion.div>

					{session && (
						<button
							className="md:hidden relative p-2 rounded-md hover:bg-emerald-500/10 transition-colors"
							onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
						>
							<div
								className="w-5 h-0.5 bg-emerald-400 mb-1 transform transition-transform duration-200 ease-in-out"
								style={{
									transform: isMobileMenuOpen
										? "rotate(45deg) translate(4px, 4px)"
										: "none",
								}}
							/>
							<div
								className="w-5 h-0.5 bg-emerald-400 mb-1 transition-opacity duration-200 ease-in-out"
								style={{ opacity: isMobileMenuOpen ? 0 : 1 }}
							/>
							<div
								className="w-5 h-0.5 bg-emerald-400 transform transition-transform duration-200 ease-in-out"
								style={{
									transform: isMobileMenuOpen
										? "rotate(-45deg) translate(4px, -4px)"
										: "none",
								}}
							/>
						</button>
					)}

					{session && (
						<div className="hidden md:flex items-center gap-1">
							{tabs.map((tab) => (
								<motion.button
									key={tab.id}
									onClick={() => setActiveTab(tab.id)}
									className="relative px-2 lg:px-3 py-1.5 lg:py-2 group"
									whileTap={{ scale: 0.95 }}
								>
									<div
										className={`absolute inset-0 rounded-md transition-colors duration-200 ${
											activeTab === tab.id
												? "bg-emerald-500/10"
												: "group-hover:bg-emerald-500/5"
										}`}
									/>

									<div className="relative flex items-center gap-1.5">
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
											className={`text-xs lg:text-sm font-medium transition-colors duration-200 ${
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

				<AnimatePresence>
					{isMobileMenuOpen && session && (
						<motion.div
							initial={{ opacity: 0, y: -20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -20 }}
							transition={{ duration: 0.2 }}
							className="absolute top-16 left-0 right-0 bg-zinc-900/50 backdrop-blur-sm border-b border-zinc-800 py-2 md:hidden z-50"
						>
							{tabs.map((tab) => (
								<motion.button
									key={tab.id}
									onClick={() => {
										setActiveTab(tab.id);
										setIsMobileMenuOpen(false);
									}}
									className="w-full flex items-center gap-3 px-6 py-2.5 text-left"
									whileTap={{ scale: 0.98 }}
								>
									<span
										className={`${
											activeTab === tab.id
												? "text-emerald-400"
												: "text-zinc-400"
										}`}
									>
										{tab.icon}
									</span>
									<span
										className={`text-sm font-medium ${
											activeTab === tab.id
												? "text-emerald-400"
												: "text-zinc-400"
										}`}
									>
										{tab.label}
									</span>
								</motion.button>
							))}
						</motion.div>
					)}
				</AnimatePresence>

				<div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
					{session ? (
						<>
							{isBothConnected && (
								<div className="relative" ref={tokensDropdownRef}>
									<motion.button
										onClick={() =>
											setIsTokensDropdownOpen(!isTokensDropdownOpen)
										}
										whileTap={{ scale: 0.98 }}
										className="flex items-center rounded-lg gap-1 sm:gap-2 relative z-10 border px-2 py-1.5 overflow-hidden border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800/40 transition-colors"
									>
										<DollarSign className="text-emerald-400 w-3.5 h-3.5" />
										{isLoadingTokens ? (
											<Loader2 className="text-emerald-400 w-3.5 h-3.5 animate-spin" />
										) : (
											<span className="font-medium text-emerald-400 text-xs sm:text-sm">
												{formatUsdValue(totalUsdValue)}
												{totalChange24h !== 0 && (
													<span
														className={`ml-1 text-xs ${
															totalChange24h > 0
																? "text-green-400"
																: "text-red-400"
														}`}
													>
														{totalChange24h > 0 ? "↑" : "↓"}
														{Math.abs(totalChange24h).toFixed(1)}%
													</span>
												)}
											</span>
										)}
										<ChevronDown
											className={`w-3.5 h-3.5 text-emerald-400 transition-transform duration-200 ${
												isTokensDropdownOpen ? "rotate-180" : ""
											}`}
										/>
									</motion.button>

									<AnimatePresence>
										{isTokensDropdownOpen && (
											<motion.div
												initial={{ opacity: 0, y: 10, scale: 0.95 }}
												animate={{ opacity: 1, y: 0, scale: 1 }}
												exit={{ opacity: 0, y: 10, scale: 0.95 }}
												transition={{ duration: 0.2 }}
												className="absolute right-0 mt-2 w-56 md:w-64 origin-top-right rounded-lg bg-zinc-900 border border-zinc-800 shadow-xl overflow-hidden"
											>
												<div className="p-2 border-b border-zinc-800">
													<p className="text-xs text-zinc-400">Your Tokens</p>
												</div>

												<div className="max-h-56 md:max-h-64 overflow-y-auto">
													{isLoadingTokens ? (
														<div className="p-3 flex justify-center">
															<Loader2 className="animate-spin text-emerald-400" />
														</div>
													) : tokenError ? (
														<div className="p-2 text-red-400 text-xs">
															{tokenError}
														</div>
													) : (
														balances.map((token, index) => (
															<div
																key={index}
																className="flex items-center justify-between p-2 hover:bg-zinc-800/50 transition-colors"
															>
																<div className="flex items-center gap-2">
																	<FaCoins className="text-emerald-400 text-xs" />
																	<div>
																		<p className="text-xs font-medium text-zinc-200">
																			{token.symbol}
																		</p>
																		<p className="text-xs text-zinc-400">
																			{formatTokenAmount(
																				token.amount,
																				token.symbol,
																			)}
																		</p>
																	</div>
																</div>
																<div className="text-right">
																	<p className="text-xs text-emerald-400">
																		{formatUsdValue(token.usdValue)}
																	</p>
																	{token.change24h !== undefined && (
																		<p
																			className={`text-xs ${
																				token.change24h > 0
																					? "text-green-400"
																					: "text-red-400"
																			}`}
																		>
																			{token.change24h > 0 ? "↑" : "↓"}
																			{Math.abs(token.change24h).toFixed(1)}%
																		</p>
																	)}
																</div>
															</div>
														))
													)}
												</div>

												<div className="p-2 border-t border-zinc-800 bg-zinc-800/30">
													<div className="flex items-center justify-between">
														<div>
															<p className="text-xs font-medium text-zinc-300">
																Total Value
															</p>
															{totalChange24h !== 0 && (
																<p
																	className={`text-xs ${
																		totalChange24h > 0
																			? "text-green-400"
																			: "text-red-400"
																	}`}
																>
																	24h: {totalChange24h > 0 ? "+" : ""}
																	{totalChange24h.toFixed(1)}%
																</p>
															)}
														</div>
														<p className="text-xs font-bold text-emerald-400">
															{formatUsdValue(totalUsdValue)}
														</p>
													</div>
													<button
														onClick={refreshBalances}
														className="mt-2 w-full text-xs text-emerald-400 hover:text-emerald-300 rounded-md border border-zinc-800 py-1 transition-colors"
													>
														Refresh Balances
													</button>
												</div>
											</motion.div>
										)}
									</AnimatePresence>
								</div>
							)}

							{keplrWalletAddress ? (
								<div className="hidden sm:flex items-center rounded-lg gap-2 relative z-10 border px-2 lg:px-3 py-1.5 overflow-hidden border-zinc-800 bg-zinc-900/60">
									<FaWallet className="text-emerald-400 w-3.5 h-3.5" />
									<span className="text-xs text-zinc-300">
										{keplrWalletAddress.slice(0, 4)}...
										{keplrWalletAddress.slice(-4)}
									</span>
									<button
										onClick={disconnectKeplrWallet}
										className="text-red-400 hover:text-red-300 transition-colors"
									>
										<LogOut className="w-3.5 h-3.5" />
									</button>
								</div>
							) : (
								<button
									onClick={() => connectKeplrWallet()}
									className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 rounded-lg border border-zinc-800 px-2 py-1.5 relative overflow-hidden bg-zinc-900/60 hover:bg-zinc-800/40 transition-colors"
								>
									<FaWallet className="w-3.5 h-3.5" />
									<span className="text-xs">Connect</span>
								</button>
							)}

							<div className="relative" ref={userDropdownRef}>
								<motion.button
									onClick={() => setIsDropdownOpen(!isDropdownOpen)}
									whileTap={{ scale: 0.95 }}
									className="relative"
								>
									<div className="p-0.5 rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600">
										<div className="rounded-full p-0.5 bg-zinc-900 relative">
											<Image
												src={session.user?.image || "/placeholder-user.jpg"}
												alt="Profile"
												width={28}
												height={28}
												className="rounded-full"
											/>
											<div
												className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-zinc-900 ${
													keplrWalletAddress
														? "bg-green-400"
														: "bg-amber-400 animate-pulse"
												}`}
											/>
										</div>
									</div>
								</motion.button>

								<AnimatePresence>
									{isDropdownOpen && (
										<motion.div
											initial={{ opacity: 0, y: 10, scale: 0.95 }}
											animate={{ opacity: 1, y: 0, scale: 1 }}
											exit={{ opacity: 0, y: 10, scale: 0.95 }}
											transition={{ duration: 0.2 }}
											className="absolute right-0 mt-2 w-56 md:w-64 origin-top-right rounded-lg bg-zinc-900 border border-zinc-800 shadow-xl overflow-hidden z-50"
										>
											<div className="p-3 border-b border-zinc-800">
												<div className="flex items-center gap-3">
													<div className="relative">
														<Image
															src={
																session.user?.image || "/placeholder-user.jpg"
															}
															alt="Profile"
															width={36}
															height={36}
															className="rounded-full"
														/>
														<div
															className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-zinc-900 ${
																keplrWalletAddress
																	? "bg-green-400"
																	: "bg-amber-400 animate-pulse"
															}`}
														/>
													</div>
													<div>
														<p className="text-xs font-medium text-zinc-200">
															{session.user?.name}
														</p>
														<p className="text-xs text-zinc-400">
															{session.user?.email}
														</p>
													</div>
												</div>

												<div
													className={`mt-2 py-1 px-2 rounded text-xs flex items-center gap-1.5 ${
														keplrWalletAddress
															? "bg-green-500/10 text-green-400 border border-green-500/20"
															: "bg-amber-500/10 text-amber-400 border border-amber-500/20"
													}`}
												>
													{keplrWalletAddress ? (
														<>
															<CheckCircle className="w-3 h-3" /> Wallet
															Connected
														</>
													) : (
														<>
															<AlertCircle className="w-3 h-3" /> Wallet
															Connection Required
														</>
													)}
												</div>
											</div>

											<div className="md:hidden p-3 border-b border-zinc-800">
												{keplrWalletAddress ? (
													<div className="flex items-center justify-between">
														<div className="flex items-center gap-2">
															<FaWallet className="text-emerald-400 w-3.5 h-3.5" />
															<span className="text-xs text-zinc-300">
																{keplrWalletAddress.slice(0, 6)}...
																{keplrWalletAddress.slice(-4)}
															</span>
														</div>
														<button
															onClick={() => {
																disconnectKeplrWallet();
																setIsDropdownOpen(false);
															}}
															className="text-red-400 hover:text-red-300 transition-colors"
														>
															<LogOut className="w-3.5 h-3.5" />
														</button>
													</div>
												) : (
													<button
														onClick={() => {
															connectKeplrWallet();
															setIsDropdownOpen(false);
														}}
														className="w-full flex items-center justify-center gap-2 text-emerald-400 hover:text-emerald-300 rounded-lg border border-zinc-800 px-3 py-1.5 bg-zinc-900/60 hover:bg-zinc-800/40 transition-colors"
													>
														<FaWallet className="w-3.5 h-3.5" />
														<span className="text-xs">Connect Wallet</span>
													</button>
												)}
											</div>

											<div className="p-2">
												<motion.button
													whileTap={{ scale: 0.98 }}
													onClick={() => {
														signOut({ callbackUrl: "/" });
														setIsDropdownOpen(false);
													}}
													className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
												>
													<FaSignOutAlt className="w-3.5 h-3.5" />
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
							whileTap={{ scale: 0.95 }}
							className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 rounded-lg border border-zinc-800 px-2 sm:px-3 py-1.5 relative overflow-hidden bg-zinc-900/60 hover:bg-zinc-800/40 transition-colors"
						>
							<div className="relative flex items-center gap-1.5">
								{isLoading ? (
									<>
										<Loader2 className="animate-spin w-3.5 h-3.5" />
										<span className="text-xs">Connecting...</span>
									</>
								) : (
									<>
										<FaGithub className="w-3.5 h-3.5" />
										<span className="text-xs">Connect GitHub</span>
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
