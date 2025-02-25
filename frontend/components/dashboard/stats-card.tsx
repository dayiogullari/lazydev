"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
	useTokenBalances,
	formatTokenAmount,
	formatUsdValue,
} from "@/utils/balance-fetch";
import { Loader2 } from "lucide-react";

interface StatsCardProps {
	title: string;
	value?: string | number;
	icon: React.ReactNode;
	trend?: string;
	trendUp?: boolean;
	tokenSymbol?: string;
	isTokenCard?: boolean;
	isUsdValue?: boolean;
	keplrWalletAddress?: string;
}

export function StatsCard({
	title,
	value,
	icon,
	trend,
	trendUp,
	tokenSymbol,
	isTokenCard = false,
	isUsdValue = false,
	keplrWalletAddress,
}: StatsCardProps) {
	const tokenBalances = useTokenBalances();
	const {
		balances,
		totalUsdValue,
		totalChange24h,
		isLoading,
		getTokenBySymbol,
	} = isTokenCard
		? tokenBalances
		: {
				balances: [],
				totalUsdValue: 0,
				totalChange24h: 0,
				isLoading: false,
				getTokenBySymbol: () => undefined,
			};

	const [displayValue, setDisplayValue] = useState<string | number>(
		value || "",
	);
	const [displayTrend, setDisplayTrend] = useState<string | undefined>(trend);
	const [isTrendUp, setIsTrendUp] = useState<boolean | undefined>(trendUp);

	useEffect(() => {
		if (isTokenCard) {
			if (tokenSymbol) {
				const tokenData = getTokenBySymbol(tokenSymbol);
				if (tokenData) {
					setDisplayValue(
						isUsdValue
							? formatUsdValue(tokenData.usdValue)
							: formatTokenAmount(tokenData.amount, tokenSymbol),
					);

					if (tokenData.change24h !== undefined) {
						setDisplayTrend(`${Math.abs(tokenData.change24h).toFixed(1)}%`);
						setIsTrendUp(tokenData.change24h >= 0);
					}
				}
			} else {
				setDisplayValue(formatUsdValue(totalUsdValue));
				if (totalChange24h !== undefined) {
					setDisplayTrend(`${Math.abs(totalChange24h).toFixed(1)}%`);
					setIsTrendUp(totalChange24h >= 0);
				}
			}
		} else if (value !== undefined) {
			setDisplayValue(value);
		}
	}, [
		balances,
		totalUsdValue,
		tokenSymbol,
		value,
		isTokenCard,
		isUsdValue,
		totalChange24h,
		getTokenBySymbol,
	]);

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -20 }}
			transition={{ duration: 0.3 }}
			className="relative rounded-xl bg-[#0A0A0A] shadow-lg border border-zinc-800 overflow-hidden"
		>
			<div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-zinc-500/0 via-zinc-500/50 to-zinc-500/0" />

			<div className="relative z-10 p-6">
				<div className="flex flex-col space-y-4">
					<div className="flex items-center justify-between">
						<span className="px-4 py-2 text-sm bg-[#09090B] text-[#c1c1c7] rounded-md flex items-center gap-2 shadow-sm ring-1 ring-zinc-700/50">
							{icon}
						</span>

						{isLoading && isTokenCard ? (
							<Loader2 className="h-8 w-16 text-zinc-800 animate-spin " />
						) : (
							displayTrend && (
								<span
									className={`text-sm font-medium px-3 py-1.5 rounded-lg flex items-center gap-2 ${
										isTrendUp
											? "bg-emerald-500/5 text-emerald-300 ring-1 ring-emerald-500/20"
											: "bg-amber-500/5 text-amber-300 ring-1 ring-amber-500/20"
									}`}
								>
									{isTrendUp ? "+" : "-"} {displayTrend}
								</span>
							)
						)}
					</div>

					<div>
						<h3 className="text-slate-400 text-sm font-medium">{title}</h3>
						{isLoading && isTokenCard ? (
							<Loader2 className="h-8 w-16 text-zinc-800 animate-spin " />
						) : (
							<p className="text-slate-300 text-2xl font-bold mt-1">
								{isTokenCard
									? !keplrWalletAddress
										? "Connect Wallet"
										: displayValue
									: displayValue}
							</p>
						)}
					</div>
				</div>
			</div>

			<div className="absolute inset-0 -translate-x-full hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
		</motion.div>
	);
}
