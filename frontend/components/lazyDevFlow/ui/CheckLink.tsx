"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export function CheckLink() {
	return (
		<motion.div
			initial={{ opacity: 0, height: "auto" }}
			animate={{ opacity: 1, height: "auto" }}
			exit={{ opacity: 0, height: 0 }}
			className="flex items-center justify-center gap-2 text-slate-400"
		>
			<Loader2 className="w-4 h-4 animate-spin" />
			<span className="text-sm">Checking GitHub connection...</span>
		</motion.div>
	);
}
