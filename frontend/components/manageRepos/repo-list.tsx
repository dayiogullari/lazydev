import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FaGithub } from "react-icons/fa";
import { ArrowRight } from "lucide-react";

interface AdminRepo {
	id: number;
	name: string;
	fullName: string;
	url: string;
	description: string;
	createdAt: string;
}

interface RepoListProps {
	repos: AdminRepo[];
	onRepoClick: (repoId: number) => void;
}

export const RepoList: React.FC<RepoListProps> = ({ repos, onRepoClick }) => {
	return (
		<div className="grid gap-4">
			{repos.map((repo) => (
				<motion.div
					key={repo.id}
					onClick={() => onRepoClick(repo.id)}
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -20 }}
					whileTap={{ scale: 0.98 }}
					className="group relative rounded-xl bg-[#0A0A0A] border border-zinc-800 cursor-pointer hover:border-[#4ADE8030]"
				>
					<div className="relative z-10 p-6">
						<div className="flex items-center justify-between gap-6">
							<div className="flex-1 space-y-4">
								<div className="flex flex-wrap items-center gap-4">
									<Link
										href={repo.url}
										target="_blank"
										className="px-4 py-2 text-sm bg-[#09090B] text-zinc-300 rounded-lg border border-zinc-800 flex items-center gap-2 hover:border-green-400/30 hover:text-green-400 transition-colors"
										onClick={(e) => e.stopPropagation()}
									>
										<FaGithub className="text-zinc-400 group-hover:text-green-400 transition-colors" />
										{repo.fullName}
									</Link>
									<div className="flex items-center gap-2 text-sm text-zinc-500 group-hover:text-green-400 transition-colors">
										<span className="w-1.5 h-1.5 rounded-full bg-current" />
										{new Date(repo.createdAt).toLocaleDateString()}
									</div>
								</div>
								<p className="text-zinc-400 group-hover:text-zinc-200 transition-colors line-clamp-2 leading-relaxed">
									{repo.description || "No description provided"}
								</p>
							</div>
							<div className="hidden md:flex items-center gap-2 text-green-400/50 group-hover:text-green-400 transition-colors">
								<span className="text-sm">Click to configure</span>
								<ArrowRight />
							</div>
						</div>
					</div>
					<div className="absolute inset-0 rounded-xl bg-gradient-to-br from-green-400/5 to-transparent opacity-0 group-hover:opacity-50 transition-opacity" />
				</motion.div>
			))}
		</div>
	);
};
