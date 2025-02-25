import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

type FlowStep = "commit" | "waiting" | "link" | "complete";

export default function MinimizedStatusBar({
  currentStep,
  commitTxHash,
  linkTxHash,
  truncateHash,
  keplrWalletAddress,
}: {
  currentStep: FlowStep;
  commitTxHash: string | null;
  linkTxHash: string | null;
  truncateHash: (hash: string, start?: number, end?: number) => string;
  keplrWalletAddress: string | null;
}) {
  return (
    <motion.div
      key="minimized-status"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="flex items-center justify-between bg-zinc-900/90 backdrop-blur-sm px-4 py-3 rounded-xl border border-zinc-800/50 shadow-lg"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </div>
        <span className="text-sm font-medium text-slate-300">
          {currentStep === "waiting"
            ? "Processing Transaction..."
            : currentStep === "link"
            ? "Ready to Link"
            : currentStep === "complete"
            ? "Verification Complete"
            : keplrWalletAddress
            ? "Commit GitHub ID"
            : "Connect Wallet"}
        </span>
      </div>

      {(commitTxHash || linkTxHash) && (
        <Link
          href={`https://neutron.celat.one/pion-1/txs/${
            commitTxHash || linkTxHash
          }`}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 bg-zinc-800/50 px-2 py-1 rounded-lg mr-8"
        >
          {truncateHash(commitTxHash || linkTxHash || "")}
          <ExternalLink className="w-3 h-3" />
        </Link>
      )}
    </motion.div>
  );
}
