import { motion } from "framer-motion";
import Link from "next/link";
import {
	FaGithub,
	FaCheckCircle,
	FaTimesCircle,
	FaExternalLinkAlt,
} from "react-icons/fa";
import { ArrowRight, Loader2 } from "lucide-react";
interface Contribution {
	prUrl: string;
	repo: string;
	date: string;
	description: string;
}

interface ErrorState {
	isAlreadyClaimed?: boolean;
	isInvalidRepo?: boolean;
}

interface ContributionCardProps {
	contribution: Contribution;
	onClaim: (contribution: Contribution) => void;
	isClaiming: boolean;
	txHash?: string;
	errorState?: ErrorState;
}

export function ContributionCard({
	contribution,
	onClaim,
	isClaiming,
	txHash,
	errorState,
}: ContributionCardProps) {
	return (
		<motion.button
			onClick={() => onClaim(contribution)}
			disabled={isClaiming || errorState?.isInvalidRepo}
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -20 }}
			whileTap={{ scale: 0.98 }}
			className="group w-full relative rounded-xl bg-[#0A0A0A] border border-zinc-800 cursor-pointer hover:border-[#4ADE8030]"
		>
			<div className="absolute inset-0 rounded-xl bg-gradient-to-br from-green-400/5 to-transparent opacity-0 group-hover:opacity-50 transition-opacity" />
			<div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-zinc-500/0 via-zinc-500/50 to-zinc-500/0" />

			<Link
				href={contribution.prUrl}
				target="_blank"
				rel="noopener"
				className="absolute inset-0 z-0"
				aria-label="View pull request"
			/>

			<div className="relative z-10 p-6">
				<div className="flex flex-col md:flex-row justify-between gap-6">
					<div className="flex-1 space-y-4">
						<div className="flex flex-wrap items-center gap-3">
							<Link
								href={contribution.prUrl}
								target="_blank"
								className="px-4 py-2 text-sm bg-[#09090B] text-zinc-300 rounded-lg border border-zinc-800 flex items-center gap-2 hover:border-green-400/30 hover:text-green-400 transition-colors"
								onClick={(e) => e.stopPropagation()}
							>
								<FaGithub className="text-zinc-400 group-hover:text-green-400 transition-colors" />
								{contribution.repo}
							</Link>

							<div className="flex items-center gap-2 text-sm text-zinc-500 group-hover:text-green-400 transition-colors">
								<span className="w-1.5 h-1.5 rounded-full bg-current" />
								{new Date(contribution.date).toLocaleDateString()}
							</div>

							{errorState?.isAlreadyClaimed && (
								<span className="px-3 py-1.5 text-sm bg-emerald-500/5 text-emerald-300 rounded-lg flex items-center gap-2 ring-1 ring-emerald-500/20">
									<FaCheckCircle className="w-3.5 h-3.5" />
									Claimed
								</span>
							)}
							{errorState?.isInvalidRepo && (
								<span className="px-3 py-1.5 text-sm bg-amber-500/5 text-amber-300 rounded-lg flex items-center gap-2 ring-1 ring-amber-500/20">
									<FaTimesCircle className="w-3.5 h-3.5" />
									Invalid Repo
								</span>
							)}
						</div>

						<p className="text-start text-zinc-400 group-hover:text-zinc-200 transition-colors line-clamp-2 leading-relaxed">
							{contribution.description}
						</p>
					</div>

					<div
						className="flex items-center gap-3 self-center"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="hidden md:flex items-center text-green-400/50 group-hover:text-green-400 transition-colors">
							{!errorState?.isAlreadyClaimed && (
								<motion.div className="flex items-center gap-2">
									{isClaiming ? (
										<div className="flex items-center gap-2 flex-row">
											<span>Processing</span>
										</div>
									) : errorState?.isInvalidRepo ? (
										"Not Eligible"
									) : (
										"Claim reward"
									)}

									{isClaiming ? (
										<Loader2 className="animate-spin size-5" />
									) : (
										<ArrowRight />
									)}
								</motion.div>
							)}
						</div>

						{txHash && (
							<motion.a
								href={`https://neutron.celat.one/pion-1/txs/${txHash}`}
								target="_blank"
								rel="noopener"
								whileHover={{ scale: 1.1 }}
								whileTap={{ scale: 0.9 }}
								className="p-2 rounded-lg bg-slate-800 text-cyan-400 hover:bg-slate-700 transition-colors shadow-sm ring-1 ring-slate-700/50"
							>
								<FaExternalLinkAlt className="w-4 h-4" />
							</motion.a>
						)}
					</div>
				</div>
			</div>
		</motion.button>
	);
}
