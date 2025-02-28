"use client";
import { motion } from "framer-motion";

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

export function StatsCard({ title, value, icon }: StatsCardProps) {
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
          </div>

          <div>
            <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
            <p className="text-slate-300 text-2xl font-bold mt-1">{value ? value : "$0.00"}</p>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 -translate-x-full hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
    </motion.div>
  );
}
