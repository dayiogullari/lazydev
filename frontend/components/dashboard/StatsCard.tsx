"use client";

import { motion } from "framer-motion";

interface StatsCardProps {
	title: string;
	value: string | number;
	icon: React.ReactNode;
	trend?: string;
	trendUp?: boolean;
}

export function StatsCard({
	title,
	value,
	icon,
	trend,
	trendUp,
}: StatsCardProps) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -20 }}
			transition={{ duration: 0.3 }}
			className="relative rounded-xl bg-[#0A0A0A] shadow-lg border border-zinc-800"
		>
			<div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-zinc-500/0 via-zinc-500/50 to-zinc-500/0" />

			<div className="relative z-10 p-6">
				<div className="flex flex-col space-y-4">
					<div className="flex items-center justify-between">
						<span className="px-4 py-2 text-sm bg-[#09090B] text-[#c1c1c7] rounded-md flex items-center gap-2 shadow-sm ring-1 ring-zinc-700/50">
							{icon}
						</span>

						{trend && (
							<span
								className={`text-sm font-medium px-3 py-1.5 rounded-lg flex items-center gap-2 ${
									trendUp
										? "bg-emerald-500/5 text-emerald-300 ring-1 ring-emerald-500/20"
										: "bg-amber-500/5 text-amber-300 ring-1 ring-amber-500/20"
								}`}
							>
								{trendUp ? "+" : "-"} {trend}
							</span>
						)}
					</div>

					<div>
						<h3 className="text-slate-400 text-sm font-medium">{title}</h3>
						<p className="text-slate-300 text-2xl font-bold mt-1">{value}</p>
					</div>
				</div>
			</div>
		</motion.div>
	);
}
