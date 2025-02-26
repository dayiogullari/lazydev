"use client";
import { motion } from "framer-motion";
import { FaCoins, FaTrophy } from "react-icons/fa";
import { useSession } from "next-auth/react";

interface LeaderboardEntry {
  rank: number;
  fullUsername: string;
  displayUsername: string;
  points: number;
  badges: number;
}

export function LeaderboardTab({
  mockLeaderboard,
}: {
  mockLeaderboard: LeaderboardEntry[];
}) {
  const { data: session } = useSession();
  const currentUser = session?.user?.githubUsername;

  const shortenName = (name: string) => {
    if (name.includes("*")) return name;
    if (name.length <= 6) return name;
    return `${name.slice(0, 3)}***${name.slice(-2)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-xl bg-[#0A0A0A] shadow-lg border border-zinc-800"
    >
      <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-zinc-500/0 via-zinc-500/50 to-zinc-500/0" />

      <div className="relative z-10 p-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-300">Leaderboard</h2>
            <div className="flex gap-2">
              <span className="text-sm px-3 py-1.5 rounded-lg bg-zinc-600/50 text-slate-300 ring-1 ring-zinc-700/50">
                Weekly Ranking
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {mockLeaderboard.map((entry) => {
              const isCurrentUser = entry.fullUsername === currentUser;
              return (
                <motion.div
                  key={entry.rank}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`group flex items-center justify-between p-4 rounded-lg transition-all ${
                    isCurrentUser
                      ? "bg-emerald-500/10 border border-emerald-500/20"
                      : "hover:bg-zinc-800/20"
                  }`}
                >
                  <div className="flex items-center gap-4 w-1/2">
                    <span
                      className={`text-sm font-medium ${
                        entry.rank === 1 ? "text-amber-400" : "text-slate-400"
                      }`}
                    >
                      #{entry.rank}
                    </span>
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                          isCurrentUser ? "bg-emerald-500 text-white" : "bg-zinc-700 text-slate-300"
                        }`}
                      >
                        {entry.fullUsername[0].toUpperCase()}
                      </div>
                      <span
                        className={`font-medium ${
                          isCurrentUser ? "text-emerald-400" : "text-slate-300"
                        }`}
                      >
                        {shortenName(entry.displayUsername)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 w-1/2">
                    <div className="flex items-center gap-2 text-slate-300 w-1/2 justify-end">
                      <FaCoins className="text-yellow-400" />
                      <span className="font-medium">{entry.points}</span>
                    </div>

                    <div className="flex items-center gap-2 w-1/2 justify-end">
                      {[...Array(entry.badges)].map((_, i) => (
                        <div
                          key={i}
                          className="p-1.5 rounded-md bg-purple-400/20 flex items-center justify-center ring-1 ring-purple-400/30"
                        >
                          <FaTrophy className="text-sm text-purple-400" />
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
