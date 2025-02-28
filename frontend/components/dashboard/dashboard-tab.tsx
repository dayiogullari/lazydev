"use client";
import { useState } from "react";
import { useKeplrWallet } from "@/providers/kepler-context";
import { claimReward } from "@/utils/claim-reward-helper";
import { ContributionCard } from "../contribution/contribution-card";
import { StatsCard } from "./stats-card";
import {
  GitPullRequest,
  Loader2,
  RefreshCw,
  DollarSign,
  CheckCircle,
} from "lucide-react";
import DashboardWelcome from "./dashboard-welcome";
import { Contribution } from "@/utils/github-contributions";

interface Props {
  contributions: Contribution[];
  loadingContributions: boolean;
  error: string | null;
  secret?: string;
  githubToken?: string;
  contractAddress: string;
  rpcUrl: string;
  fetchContributions: () => void;
}

export function DashboardTab({
  contributions,
  loadingContributions,
  contractAddress,
  rpcUrl,
  fetchContributions,
}: Props) {
  const { keplrWalletAddress } = useKeplrWallet();
  const [claimingPrUrl, setClaimingPrUrl] = useState<string | null>(null);
  const [txHashes, setTxHashes] = useState<Record<string, string>>({});
  const [claimedPrs, setClaimedPrs] = useState<Set<string>>(new Set());
  const [invalidRepos, setInvalidRepos] = useState<Set<string>>(new Set());

  const hasContributions = contributions.length > 0;

  const unclaimedContributions = contributions.filter(
    (contribution) =>
      !contribution.claimed && !claimedPrs.has(contribution.prUrl)
  );

  const claimedContributions = contributions.filter(
    (contribution) => contribution.claimed || claimedPrs.has(contribution.prUrl)
  );
  console.log("claimedContributions", claimedContributions);

  const handleClaimReward = async (contribution: Contribution) => {
    await claimReward({
      keplrWalletAddress,
      setClaimingPrUrl,
      setTxHashes,
      setClaimedPrs,
      setInvalidRepos,
      contribution,
      contractAddress,
      rpcUrl,
    });
    fetchContributions();
  };

  if (loadingContributions && contributions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (!hasContributions && !loadingContributions) {
    return <DashboardWelcome hasContributions={hasContributions} />;
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        <StatsCard
          title="Portfolio Value"
          icon={<DollarSign className="w-6 h-6" />}
          isTokenCard={true}
          keplrWalletAddress={keplrWalletAddress}
        />

        {/* <StatsCard
          title="LAZY Tokens"
          icon={<Coins className="w-6 h-6" />}
          isTokenCard={true}
          keplrWalletAddress={keplrWalletAddress}
          tokenSymbol="LAZY"
        /> */}

        <StatsCard
          title="Pull Requests"
          value={contributions.length}
          icon={<GitPullRequest className="w-6 h-6" />}
          trendUp={true}
        />
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            Available Contributions
          </h2>
          <button
            onClick={fetchContributions}
            className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-2"
            disabled={loadingContributions}
          >
            {loadingContributions ? (
              <>
                Loading
                <Loader2 className="w-4 h-4 animate-spin" />
              </>
            ) : (
              <>
                Refresh Data
                <RefreshCw className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        <div className="space-y-4">
          {unclaimedContributions.length > 0 ? (
            unclaimedContributions.map((contribution) => (
              <ContributionCard
                key={contribution.prUrl}
                contribution={contribution}
                onClaim={handleClaimReward}
                isClaiming={claimingPrUrl === contribution.prUrl}
                txHash={txHashes[contribution.prUrl]}
                errorState={{
                  isAlreadyClaimed: claimedPrs.has(contribution.prUrl),
                  isInvalidRepo: invalidRepos.has(contribution.prUrl),
                }}
              />
            ))
          ) : (
            <div className="text-center p-6 bg-zinc-900/40 rounded-xl border border-zinc-800">
              {loadingContributions ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
                  <p className="text-zinc-400">Looking for contributions...</p>
                </div>
              ) : (
                <p className="text-zinc-400">
                  All contributions have been claimed!
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {claimedContributions.length > 0 && (
        <div className="space-y-6 mt-10">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-semibold text-white">
              Claimed Rewards
            </h2>
          </div>

          <div className="space-y-4">
            {claimedContributions.map((contribution) => (
              <ContributionCard
                key={contribution.prUrl}
                contribution={contribution}
                onClaim={handleClaimReward}
                isClaiming={false}
                txHash={txHashes[contribution.prUrl]}
                errorState={{
                  isAlreadyClaimed: true,
                  isInvalidRepo: invalidRepos.has(contribution.prUrl),
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
