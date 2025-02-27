"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FaGithub, FaArrowLeft, FaTag, FaPlus } from "react-icons/fa";
import { CheckCircle, Loader2 } from "lucide-react";
import ReactJson from "react-json-view";
import { ConfigurationButton } from "./config-button";
import { repoHelpers } from "./helpers/handle-commit-link";
import { ConfigItem, RepoDetailsProps } from "./helpers/types";
import { useWindowSize } from "react-use";
import Confetti from "react-confetti";
import { RepoConfig } from "@/ts/lazydev/Lazydev.types";

export const RepoDetails: React.FC<RepoDetailsProps> = ({
  selectedRepo,
  deployedContracts,
  onBack,
  session,
  keplrWalletAddress,
}) => {
  const [selectedLabel, setSelectedLabel] = useState<string>("");
  const [selectedContract, setSelectedContract] = useState<string>("");
  const [committedConfigs, setCommittedConfigs] = useState<ConfigItem[]>([]);

  const [config, setConfig] = useState<string>("");
  const [configurations, setConfigurations] = useState<ConfigItem[]>([]);
  const [showJson, setShowJson] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isCommitted, setIsCommitted] = useState(false);
  const [commitTxHash, setCommitTxHash] = useState<string | null>(null);
  const [isLinked, setIsLinked] = useState<boolean>(false);
  const [repoConfigDiff, setRepoConfigDiff] = useState<boolean>(false);
  const [acceptConfigDiff, setAcceptConfigDiff] = useState<boolean>(false);
  const [isAlreadyLinked, setIsAlreadyLinked] = useState<boolean>(false);
  const [oldCommitmentResult, setOldCommitmentResult] = useState<
    RepoConfig | undefined
  >(undefined);
  const { width, height } = useWindowSize();

  useEffect(() => {
    if (acceptConfigDiff) {
      setIsConfiguring(true);
      handleLinkRepo();

      setAcceptConfigDiff(false);
    }
  }, [acceptConfigDiff]);

  const handleAddConfig = () => {
    if (!selectedLabel || !selectedContract || !config) return;
    const label = selectedRepo.labels.find(
      (l) => l.id.toString() === selectedLabel
    );
    const contract = deployedContracts.find(
      (c) => c.address === selectedContract
    );
    if (!label || !contract) return;
    const newConfig: ConfigItem = {
      labelId: label.id,
      reward_contract: contract.address,
      reward_config: config,
    };
    setConfigurations([...configurations, newConfig]);
    setSelectedLabel("");
    setSelectedContract("");
    setConfig("");
  };

  const handleLinkRepo = async () => {
    const res = await repoHelpers.linkRepo({
      selectedRepo,
      configurations,
      session,
      keplrWalletAddress,
      setIsConfiguring,
      setCommitTxHash,
      setIsCommitted,
      setIsLinked,
      setRepoConfigDiff,
      setOldCommitmentResult,
      setIsAlreadyLinked,
      acceptConfigDiff,
    });

    if (res) {
      setCommittedConfigs((prev) => [...prev, ...configurations]);
      setConfigurations([]);
      setSelectedLabel("");
      setSelectedContract("");
      setConfig("");
      setRepoConfigDiff(false);
      setAcceptConfigDiff(false);
    }
  };

  const [org, repo] = selectedRepo.fullName.split("/");

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-300 hover:text-slate-100 transition-colors"
      >
        <FaArrowLeft />
        Back to Repositories
      </button>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl bg-[#0A0A0A] shadow-lg border border-zinc-800 p-6"
      >
        {repoConfigDiff && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-[#0A0A0A] p-6 rounded-lg shadow-lg border border-zinc-800 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold text-slate-100 mb-4">
                Configuration Difference Detected
              </h2>
              <div className="text-slate-300 mb-6">
                <p className="mb-4">
                  There are differences between your current configuration and
                  the previously committed configuration. Using the committed
                  configuration is required for linking.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium text-emerald-400 flex items-center gap-2">
                      <span className="inline-block w-3 h-3 bg-emerald-400 rounded-full"></span>
                      Committed Configuration
                    </h3>
                    <div className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800 overflow-x-auto max-h-[300px] overflow-y-auto">
                      <pre className="text-sm text-slate-300 font-mono whitespace-pre-wrap">
                        {JSON.stringify(oldCommitmentResult, null, 2)}
                      </pre>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium text-amber-400 flex items-center gap-2">
                      <span className="inline-block w-3 h-3 bg-amber-400 rounded-full"></span>
                      Your Current Configuration
                    </h3>
                    <div className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800 overflow-x-auto max-h-[300px] overflow-y-auto">
                      <pre className="text-sm text-slate-300 font-mono whitespace-pre-wrap">
                        {JSON.stringify(
                          {
                            label_configs: configurations.map((config) => ({
                              label_id: config.labelId,
                              reward_config: config.reward_config,
                              reward_contract: config.reward_contract,
                            })),
                          },
                          null,
                          2
                        )}
                      </pre>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-amber-400/10 border border-amber-400/20 rounded-lg mb-2">
                  <p className="text-amber-300 text-sm">
                    <strong>Note:</strong> Proceeding will use the{" "}
                    <strong>committed configuration</strong> (green) instead of
                    your current configuration. Your current configuration
                    changes will not be applied.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  onClick={() => {
                    setRepoConfigDiff(false);
                    setIsConfiguring(false);
                  }}
                  className="px-4 py-2 rounded-md bg-zinc-700 text-white hover:bg-zinc-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setRepoConfigDiff(false);
                    setAcceptConfigDiff(true);
                  }}
                  className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors"
                >
                  Proceed with Committed Config
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-2xl font-bold text-slate-100">
              {org}
              <span className="text-gray-500 px-1">/</span>
              {repo}
            </div>
            <Link
              href={selectedRepo.url}
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#09090B] text-[#c1c1c7] hover:bg-zinc-700 transition-colors"
            >
              <FaGithub />
              View on GitHub
            </Link>
          </div>
          <p className="text-slate-300">
            {selectedRepo.description || "No description provided"}
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FaTag className="text-emerald-400" />
              <h2 className="text-xl font-semibold text-slate-100">
                Configure Labels
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={selectedLabel}
                onChange={(e) => setSelectedLabel(e.target.value)}
                className="px-4 py-2 rounded-md bg-[#09090B] text-[#c1c1c7] border border-zinc-800"
              >
                <option value="">Select Label</option>
                {selectedRepo.labels.map((label) => (
                  <option
                    key={label.id}
                    value={label.id}
                  >
                    {label.name}
                  </option>
                ))}
              </select>
              <select
                value={selectedContract}
                onChange={(e) => setSelectedContract(e.target.value)}
                className="px-4 py-2 rounded-md bg-[#09090B] text-[#c1c1c7] border border-zinc-800"
              >
                <option value="">Select Contract</option>
                {deployedContracts.map((contract) => (
                  <option
                    key={contract.address}
                    value={contract.address}
                  >
                    {contract.name} ({contract.symbol})
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <input
                  value={config}
                  onChange={(e) => setConfig(e.target.value)}
                  placeholder="Enter config"
                  className="flex-1 px-4 py-2 rounded-md bg-[#09090B] text-[#c1c1c7] border border-zinc-800"
                />
                <button
                  onClick={handleAddConfig}
                  disabled={!selectedLabel || !selectedContract || !config}
                  className="px-4 py-2 rounded-md bg-[#09090B] text-[#c1c1c7] hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <FaPlus />
                  Add
                </button>
              </div>
            </div>

            {configurations.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold text-slate-100">
                      Display Configuration
                    </h2>
                    {isCommitted && (
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-400/10 border border-green-400/20">
                        {isLinked || isAlreadyLinked ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <Loader2 className="w-4 h-4 text-orange-400 animate-spin" />
                        )}
                        <span
                          className={`text-xs font-medium ${
                            isLinked || isAlreadyLinked
                              ? "text-green-400"
                              : "text-orange-400"
                          }`}
                        >
                          {isLinked
                            ? "Linked"
                            : isAlreadyLinked
                            ? "Already Linked"
                            : "Linking"}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowJson(!showJson)}
                      className="px-4 py-2 text-sm bg-[#09090B] text-[#c1c1c7] rounded-md ring-zinc-700/50 flex items-center gap-2 hover:bg-zinc-700 transition-colors shadow-sm ring-1"
                    >
                      {showJson ? "Show Pretty" : "Show JSON"}
                    </button>
                  </div>
                </div>
                {showJson ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-mono"
                  >
                    <div className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800 overflow-x-auto">
                      <ReactJson
                        src={configurations}
                        theme={{
                          base00: "#09090B",
                          base01: "#09090B",
                          base02: "#09090B",
                          base03: "#22C55D",
                          base04: "#22C55D",
                          base05: "#34D399",
                          base06: "#22C55D",
                          base07: "#ffffff",
                          base08: "#22C55D",
                          base09: "#22C55D",
                          base0A: "#22C55D",
                          base0B: "#22C55D",
                          base0C: "#22C55D",
                          base0D: "#22C55D",
                          base0E: "#22C55D",
                          base0F: "#22C55D",
                        }}
                        collapsed={false}
                        enableClipboard={false}
                        displayDataTypes={false}
                        name={false}
                      />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid gap-3 w-full"
                  >
                    {configurations.map((config, index) => {
                      const label = selectedRepo.labels.find(
                        (l) => l.id === config.labelId
                      );
                      const contract = deployedContracts.find(
                        (c) => c.address === config.reward_contract
                      );
                      return (
                        <div
                          key={index}
                          className="group flex items-center justify-between p-4 w-full rounded-lg border border-zinc-800/50 bg-[#09090B] hover:border-green-400/20 transition-all duration-300"
                        >
                          <div className="flex items-center gap-8 w-full">
                            <div className="px-3 py-1 ">
                              <span className="text-xs font-mono text-green-400">
                                CONFIG
                              </span>
                            </div>
                            <div className="h-6 w-px bg-zinc-800/50" />
                            <div className="flex flex-col gap-1 min-w-[120px]">
                              <span className="text-xs text-zinc-500 font-medium">
                                LABEL
                              </span>
                              <span className="text-sm font-mono">
                                <span
                                  style={{ background: `#${label?.color}` }}
                                  className="w-2 h-2 rounded-full inline-block mr-1"
                                />
                                {label?.name || "—"}
                              </span>
                            </div>
                            <div className="flex flex-col gap-1 min-w-[180px]">
                              <span className="text-xs text-zinc-500 font-medium">
                                CONTRACT
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-green-400 font-mono">
                                  {contract?.name || "UNKNOWN"}
                                </span>
                                <span className="text-xs text-zinc-500">
                                  ({contract?.symbol || "???"})
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col gap-1 flex-1">
                              <span className="text-xs text-zinc-500 font-medium">
                                REWARD CONFIG
                              </span>
                              <span className="text-sm text-zinc-200 font-mono">
                                {config.reward_config}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </motion.div>
                )}
                <div className="mt-6 space-y-4">
                  <div className="flex justify-end">
                    <ConfigurationButton
                      configurations={configurations}
                      isConfiguring={isConfiguring}
                      isLinked={isLinked}
                      isAlreadyLinked={isAlreadyLinked}
                      handleLinkRepo={() => {
                        setIsConfiguring(true);
                        handleLinkRepo();
                        setCommitTxHash(null);
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
      {committedConfigs.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-12 space-y-6"
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="text-emerald-400" />
            <h2 className="text-xl font-semibold text-slate-100">
              Committed Configurations
            </h2>
          </div>

          {committedConfigs.map((config, index) => {
            const label = selectedRepo.labels.find(
              (l) => l.id === config.labelId
            );
            const contract = deployedContracts.find(
              (c) => c.address === config.reward_contract
            );

            return (
              <div
                key={index}
                className="p-4 rounded-lg border border-emerald-400/20 bg-emerald-400/5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span
                      style={{ background: `#${label?.color}` }}
                      className="w-3 h-3 rounded-full"
                    />
                    <span className="font-medium">{label?.name}</span>
                    <span className="text-sm text-emerald-400 font-mono">
                      {contract?.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <a
                      href={`https://neutron.celat.one/pion-1/txs/${commitTxHash}`}
                      className="text-emerald-400 hover:text-emerald-300"
                    >
                      View Transaction
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>
      )}

      {isLinked && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={200}
        />
      )}
    </div>
  );
};
