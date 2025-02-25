"use client";

import { motion } from "framer-motion";
import { Copy, Link } from "lucide-react";
import { useState } from "react";

interface UserLinkedProps {
	githubUserName?: string;
	keplrWalletAddress: string;
}

export function UserLinked({
	githubUserName,
	keplrWalletAddress,
}: UserLinkedProps) {
	const [isClicked, setIsClicked] = useState(false);
	const handleCopyAddress = (address: string) => {
		setIsClicked(true);
		navigator.clipboard.writeText(address);
		setTimeout(() => {
			setIsClicked(false);
		}, 1000);
	};
	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			className="flex items-center justify-center gap-3"
		>
			<div className="flex gap-3 items-center">
				<div className="px-3 py-1.5 bg-[#111113] rounded-lg border border-slate-700/50 text-xs text-white">
					{githubUserName || "GitHub User"}
				</div>
				<Link className="text-green-500 rotate-45 size-4" />
				<div className="px-3 py-1.5 bg-[#111113] rounded-lg border border-slate-700/50 text-xs text-white font-mono flex gap-2 justify-center items-center">
					{keplrWalletAddress?.substring(0, 6)}...
					{keplrWalletAddress?.substring(keplrWalletAddress.length - 4)}
					<button
						className="relative"
						onClick={() => handleCopyAddress(keplrWalletAddress)}
					>
						{isClicked && (
							<motion.h1
								className="absolute -right-6 bg-[#27272A]/10 rounded-full px-2 py-1 text-xs text-white"
								initial={{ y: -25 }}
								animate={{ y: -40 }}
								transition={{ duration: 0.5 }}
							>
								Copied
							</motion.h1>
						)}
						<Copy className="text-[#939397] size-3 cursor-pointer hover:text-slate-200" />
					</button>
				</div>
			</div>
		</motion.div>
	);
}
