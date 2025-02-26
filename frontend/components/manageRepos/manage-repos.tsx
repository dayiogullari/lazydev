import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  Search,
  SortAsc,
  SortDesc,
} from "lucide-react";

import { RepoList } from "./repo-list";
import { RepoDetails } from "./repo-details";
import OrganizationWelcome from "./organization-welcome";
import ContractBuilder from "./contract-builder";

import { useKeplrWallet } from "@/providers/kepler-context";
import { getDeployedContracts } from "@/utils/manage-repos/local-built-contracts";
import {
  fetchAdminRepos,
  fetchRepoDetails,
  PaginationInfo,
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

type SortOption = "newest" | "oldest" | "name-asc" | "name-desc";

export function ManageReposTab() {
  const { data: session } = useSession();
  const { keplrWalletAddress } = useKeplrWallet();
  const [activeTab, setActiveTab] = useState("manage-repos");
  const [allRepos, setAllRepos] = useState<AdminRepo[]>([]);
  const [filteredRepos, setFilteredRepos] = useState<AdminRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRepo, setSelectedRepo] = useState<RepoDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [deployedContracts, setDeployedContracts] = useState<ContractData[]>(
    []
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    perPage: 100,
    totalCount: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("newest");

  useEffect(() => {
    setDeployedContracts(getDeployedContracts());
  }, []);

  useEffect(() => {
    async function fetchRepos() {
      if (session?.accessToken) {
        try {
          setLoading(true);
          const { repos: adminRepos, pagination: paginationInfo } =
            await fetchAdminRepos(session.accessToken, currentPage, 100);
          setAllRepos(adminRepos);
          setFilteredRepos(adminRepos);
          setPagination(paginationInfo);
        } catch (err) {
          setError("Failed to load repositories");
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    }
    fetchRepos();
  }, [session, currentPage]);

  useEffect(() => {
    if (allRepos.length === 0) return;

    let result = [...allRepos];
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (repo) =>
          repo.name.toLowerCase().includes(query) ||
          repo.fullName.toLowerCase().includes(query)
      );
    }

    switch (sortOption) {
      case "newest":
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "oldest":
        result.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
    }

    setFilteredRepos(result);
  }, [allRepos, searchQuery, sortOption]);

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

  const handleNextPage = () => {
    if (pagination.hasNextPage) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (pagination.hasPreviousPage) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSortChange = (option: SortOption) => {
    setSortOption(option);
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
      {allRepos.length > 0 && (
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
        allRepos.length === 0 ? (
          <OrganizationWelcome />
        ) : (
          <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div className="relative w-full md:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search
                    size={16}
                    className="text-zinc-400"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Search repositories..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="block w-full pl-10 pr-3 py-2 border border-zinc-700 rounded-md bg-zinc-800/30 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-green-400 focus:border-green-400"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-zinc-400 text-sm">Sort by:</span>
                <div className="relative inline-block">
                  <select
                    value={sortOption}
                    onChange={(e) =>
                      handleSortChange(e.target.value as SortOption)
                    }
                    className="appearance-none pl-3 pr-8 py-2 border border-zinc-700 rounded-md bg-zinc-800/30 text-zinc-200 focus:outline-none focus:ring-1 focus:ring-green-400 focus:border-green-400"
                  >
                    <option value="newest">Date (Newest first)</option>
                    <option value="oldest">Date (Oldest first)</option>
                    <option value="name-asc">Name (A-Z)</option>
                    <option value="name-desc">Name (Z-A)</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    {sortOption === "newest" || sortOption === "name-desc" ? (
                      <SortDesc
                        size={16}
                        className="text-zinc-400"
                      />
                    ) : (
                      <SortAsc
                        size={16}
                        className="text-zinc-400"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {filteredRepos.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-zinc-400">
                  No repositories match your search.
                </p>
              </div>
            ) : (
              <RepoList
                repos={filteredRepos}
                onRepoClick={handleRepoClick}
              />
            )}

            {(pagination.hasNextPage || pagination.hasPreviousPage) &&
              !searchQuery && (
                <div className="flex justify-center items-center gap-4 mt-6">
                  <button
                    onClick={handlePrevPage}
                    disabled={!pagination.hasPreviousPage}
                    className={`flex items-center gap-1 px-3 py-2 rounded-md transition-colors ${
                      pagination.hasPreviousPage
                        ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-100"
                        : "bg-zinc-800/50 text-zinc-500 cursor-not-allowed"
                    }`}
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>

                  <span className="text-zinc-400">
                    Page {pagination.page}
                    {pagination.totalCount > 0 &&
                      ` of ${Math.ceil(
                        pagination.totalCount / pagination.perPage
                      )}`}
                  </span>

                  <button
                    onClick={handleNextPage}
                    disabled={!pagination.hasNextPage}
                    className={`flex items-center gap-1 px-3 py-2 rounded-md transition-colors ${
                      pagination.hasNextPage
                        ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-100"
                        : "bg-zinc-800/50 text-zinc-500 cursor-not-allowed"
                    }`}
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
          </>
        )
      ) : (
        <ContractBuilder />
      )}
    </div>
  );
}

export default ManageReposTab;
