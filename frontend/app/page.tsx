"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

import { rpc_url, contract_address } from "@/utils/consts";
import ChallengesTab from "@/components/challenges-tap";
import LazydevInteraction from "@/components/lazyDevFlow/lazy-dev-interaction";
import { NavBar } from "@/components/ui/navbar";
import { DashboardTab } from "@/components/dashboard/dashboard-tab";
import { LeaderboardTab } from "@/components/dashboard/leaderboard-tab";
import AchievementsTab from "@/components/achievments-tab";
import { ProfileTab } from "@/components/profile/profile-tab";
import { Footer } from "@/components/ui/footer";
import { ManageReposTab } from "@/components/manageRepos/manage-repos";
import {
  Contribution,
  getGithubContributions,
} from "@/utils/github-contributions";

export default function Home() {
  const { data: session, status } = useSession();
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loadingContributions, setLoadingContributions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  const mockLeaderboard = [
    {
      rank: 1,
      fullUsername: "developer123",
      displayUsername: "Dev****23",
      points: 1200,
      badges: 3,
    },
    {
      rank: 2,
      fullUsername: "codemaster45",
      displayUsername: "Cod***er45",
      points: 900,
      badges: 2,
    },
    {
      rank: 3,
      fullUsername: "zkWizard99",
      displayUsername: "zkW***99",
      points: 750,
      badges: 1,
    },
  ];

  useEffect(() => {
    if (status === "authenticated") {
      fetchContributions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session?.user?.email]);

  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(
    new Set([activeTab])
  );

  useEffect(() => {
    setVisitedTabs((prev) => new Set([...prev, activeTab]));
  }, [activeTab]);

  const fetchContributions = async () => {
    if (!session?.user?.githubUsername || !session?.accessToken) return;
    setLoadingContributions(true);
    setError(null);
    setContributions([]);
    try {
      // Use the callback to progressively update the UI
      await getGithubContributions(
        session.user.githubUsername,
        // setContributions,
        (updatedContribution) => {
          setContributions((currentContributions) => {
            // Find if this contribution already exists in our state
            const existingIndex = currentContributions.findIndex(
              (c) => c.prUrl === updatedContribution.prUrl
            );

            if (existingIndex >= 0) {
              // Update existing contribution
              const newContributions = [...currentContributions];
              newContributions[existingIndex] = updatedContribution;
              return newContributions;
            } else {
              // Add new contribution
              return [...currentContributions, updatedContribution];
            }
          });
        }
      );

      console.log("contributions", contributions);

      toast.success("Contributions loaded!");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      toast.error("Failed to load contributions.");
      console.error("Error fetching contributions:", err);
    } finally {
      setLoadingContributions(false);
    }
  };

  return (
    <div className="min-h-screen pt-12 text-slate-100 flex flex-col relative">
      <NavBar
        session={session}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="max-w-7xl mx-auto w-full px-4 mt-8">
        <LazydevInteraction
          rpcUrl={rpc_url}
          contractAddress={contract_address}
        />
      </div>

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-8">
        {Array.from(visitedTabs).map((tab) => (
          <div
            key={tab}
            className={activeTab !== tab ? "hidden" : ""}
          >
            <AnimatePresence mode="wait">
              {activeTab === tab && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {tab === "dashboard" && (
                    <DashboardTab
                      rpcUrl={rpc_url}
                      contractAddress={contract_address}
                      contributions={contributions}
                      loadingContributions={loadingContributions}
                      error={error}
                      fetchContributions={fetchContributions}
                    />
                  )}

                  {tab === "leaderboard" && (
                    <LeaderboardTab mockLeaderboard={mockLeaderboard} />
                  )}

                  {tab === "achievements" && <AchievementsTab />}
                  {tab === "challenges" && <ChallengesTab />}
                  {tab === "profile" && <ProfileTab session={session} />}
                  {tab === "manage-repos" && <ManageReposTab />}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </main>
      <Footer />
    </div>
  );
}
