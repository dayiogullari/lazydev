import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

import { RepoList } from "./repo-list";
import { RepoDetails } from "./repo-details";
import OrganizationWelcome from "./organization-welcome";
import ContractBuilder from "./contract-builder";

import { useKeplrWallet } from "@/providers/kepler-context";
import { getDeployedContracts } from "@/utils/manage-repos/local-built-contracts";
import {
  fetchAdminRepos,
  fetchRepoDetails,
} from "@/utils/manage-repos/repoHelpers";

interface Session {
  user: {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    githubUsername?: string | null;
  };
  accessToken: string;
  accessInstallationToken?: string;
}

interface AdminRepo {
  id: number;
  name: string;
  fullName: string;
  url: string;
  description: string;
  createdAt: string;
}

interface Label {
  id: number;
  name: string;
  color: string;
  description: string;
}

interface RepoDetails extends AdminRepo {
  labels: Label[];
}

interface ContractData {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  amountPerReward: string;
}

export function ManageReposTab() {
  const { data: session } = useSession();
  const { keplrWalletAddress } = useKeplrWallet();
  const [activeTab, setActiveTab] = useState("manage-repos");
  const [repos, setRepos] = useState<AdminRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRepo, setSelectedRepo] = useState<RepoDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [deployedContracts, setDeployedContracts] = useState<ContractData[]>(
    []
  );

  useEffect(() => {
    setDeployedContracts(getDeployedContracts());
  }, []);

  useEffect(() => {
    async function fetchRepos() {
      if (session?.accessToken) {
        try {
          const adminRepos = await fetchAdminRepos(session.accessToken);
          setRepos(adminRepos);
        } catch (err) {
          setError("Failed to load repositories");
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    }
    fetchRepos();
  }, [session]);

  const handleRepoClick = async (repoId: number) => {
    if (!session?.accessToken) return;
    setDeployedContracts(getDeployedContracts());

    setLoadingDetails(true);
    try {
      const details = await fetchRepoDetails(repoId, session.accessToken);
      setSelectedRepo(details);
    } catch (err) {
      console.error(err);
      setError("Failed to load repository details");
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleBackClick = () => {
    setSelectedRepo(null);
    setError(null);
  };

  if (loading || loadingDetails) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-400 py-8">
        <p>{error}</p>
      </div>
    );
  }

  if (selectedRepo) {
    return (
      <RepoDetails
        selectedRepo={selectedRepo}
        deployedContracts={deployedContracts}
        onBack={handleBackClick}
        session={session as Session}
        keplrWalletAddress={keplrWalletAddress}
      />
    );
  }

  return (
    <div className="space-y-8">
      {repos.length > 0 && (
        <div className="relative border-b border-zinc-800/50">
          <div className="flex gap-8 pb-2">
            <button
              onClick={() => setActiveTab("manage-repos")}
              className="relative px-1 py-3"
            >
              <span
                className={`text-xl font-semibold transition-colors ${
                  activeTab === "manage-repos"
                    ? "text-green-400"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Connected Repos
              </span>
              {activeTab === "manage-repos" && (
                <motion.div
                  layoutId="tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-green-400/0 via-green-400 to-green-400/0"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab("contract-builder")}
              className="relative px-1 py-3"
            >
              <span
                className={`text-xl font-semibold transition-colors ${
                  activeTab === "contract-builder"
                    ? "text-green-400"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Build Contract
              </span>
              {activeTab === "contract-builder" && (
                <motion.div
                  layoutId="tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-green-400/0 via-green-400 to-green-400/0"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          </div>
        </div>
      )}
      {activeTab === "manage-repos" ? (
        repos.length === 0 ? (
          <OrganizationWelcome />
        ) : (
          <RepoList
            repos={repos}
            onRepoClick={handleRepoClick}
          />
        )
      ) : (
        <ContractBuilder />
      )}
    </div>
  );
}

export default ManageReposTab;
