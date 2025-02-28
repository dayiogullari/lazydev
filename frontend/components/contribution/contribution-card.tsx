import { motion } from "framer-motion";
import Link from "next/link";
import { FaGithub, FaCheckCircle, FaTimesCircle, FaCoins } from "react-icons/fa";
import { ArrowRight, Loader2 } from "lucide-react";
import { Contribution } from "@/utils/github-contributions";

interface ErrorState {
  isAlreadyClaimed?: boolean;
  isInvalidRepo?: boolean;
}

interface ContributionCardProps {
  contribution: Contribution;
  onClaim: (contribution: Contribution) => void;
  isClaiming: boolean;
  errorState?: ErrorState;
  txHash: string;
}

export function ContributionCard({
  contribution,
  onClaim,
  isClaiming,
  errorState,
  txHash,
}: ContributionCardProps) {
  const isAlreadyClaimed = contribution.claimed || errorState?.isAlreadyClaimed;
  const isLoading = contribution.loading;

  const handleClick = () => {
    if (isAlreadyClaimed) {
      window.open(
        `https://neutron.celat.one/pion-1/txs/${contribution.txHash || txHash}`,
        "_blank",
      );
    } else if (!isLoading) {
      onClaim(contribution);
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={isClaiming || errorState?.isInvalidRepo || isLoading}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileTap={{ scale: 0.98 }}
      className={`group w-full relative rounded-xl ${
        isAlreadyClaimed ? "bg-[#0C100C]" : "bg-[#0A0A0A]"
      } border border-zinc-800 cursor-pointer hover:border-[#4ADE8030]`}
    >
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-green-400/5 to-transparent opacity-0 group-hover:opacity-50 transition-opacity" />
      <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-zinc-500/0 via-zinc-500/50 to-zinc-500/0" />

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

              {isLoading && (
                <span className="px-3 py-1.5 text-sm bg-blue-500/5 text-blue-300 rounded-lg flex items-center gap-2 ring-1 ring-blue-500/20">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Checking
                </span>
              )}

              {!isLoading && isAlreadyClaimed && (
                <span className="px-3 py-1.5 text-sm bg-emerald-500/5 text-emerald-300 rounded-lg flex items-center gap-2 ring-1 ring-emerald-500/20">
                  <FaCheckCircle className="w-3.5 h-3.5" />
                  Claimed
                </span>
              )}

              {!isLoading && errorState?.isInvalidRepo && (
                <span className="px-3 py-1.5 text-sm bg-amber-500/5 text-amber-300 rounded-lg flex items-center gap-2 ring-1 ring-amber-500/20">
                  <FaTimesCircle className="w-3.5 h-3.5" />
                  Invalid Repo
                </span>
              )}
            </div>

            <p className="text-start text-zinc-400 group-hover:text-zinc-200 transition-colors line-clamp-2 leading-relaxed">
              {contribution.description}
            </p>

            {!isLoading && isAlreadyClaimed && (
              <div className="flex flex-row gap-2">
                {contribution?.rewards?.map((reward) => (
                  <div
                    key={`${reward.rewardToken}-${reward.rewardAmount}`}
                    className="flex items-center gap-2 px-2 text-emerald-400"
                  >
                    <FaCoins className="w-4 h-4" />
                    <span className="font-medium">
                      {`${reward.rewardAmount} ${reward.rewardToken}`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 justify-center items-end">
            <div
              className="flex items-center text-green-400/50 group-hover:text-green-400 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {isLoading ? (
                <div className="flex items-center gap-2 flex-row">
                  <span>Checking status</span>
                  <Loader2 className="animate-spin size-5" />
                </div>
              ) : (
                !isAlreadyClaimed && (
                  <motion.div className="flex items-center gap-2">
                    {isClaiming ? (
                      <div className="flex items-center gap-2 flex-row">
                        <span>Processing</span>
                        <Loader2 className="animate-spin size-5" />
                      </div>
                    ) : errorState?.isInvalidRepo ? (
                      "Not Eligible"
                    ) : (
                      <div className="flex items-center gap-2">
                        <span>Claim reward</span>
                        <ArrowRight />
                      </div>
                    )}
                  </motion.div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.button>
  );
}
