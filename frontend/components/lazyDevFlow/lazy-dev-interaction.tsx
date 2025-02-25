"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useKeplrWallet } from "@/providers/kepler-context";
import { motion, AnimatePresence } from "framer-motion";
import {
  Link as LinkIcon,
  ExternalLink,
  GitCommit,
  Signature,
  ChevronUp,
  ChevronDown,
  Loader2,
} from "lucide-react";

import { checkIfGithubLinked } from "@/utils/check-github-link";

import {
  handleConnectWallet,
  handleCommitStep,
  handleLinkStep,
} from "@/utils/lazydev-helpers";
import MinimizedStatusBar from "./ui/minimized-status-bar";
import { UserLinked } from "./ui/is-user-linked";
import { StepProgressBar } from "./ui/step-progress-bar";
import { StepContent } from "./ui/step-content";
import { CompleteStep } from "./ui/complete-step";

interface LazydevInteractionProps {
  rpcUrl: string;
  contractAddress: string;
}
// "connect" |
type FlowStep = "commit" | "waiting" | "link" | "complete";

export default function LazydevInteraction({
  rpcUrl,
  contractAddress,
}: LazydevInteractionProps) {
  const { data: session } = useSession();
  const { keplrWalletAddress, connectKeplrWallet } = useKeplrWallet();

  const githubUserId = session?.user?.id ? Number(session.user.id) : null;
  const githubToken = session?.accessToken || "";

  const [secret, setSecret] = useState<Uint8Array>();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<FlowStep>("commit");

  const [isCheckingLink, setIsCheckingLink] = useState(false);
  const [isLinked, setIsLinked] = useState(false);
  const [linkedWalletAddress, setLinkedWalletAddress] = useState("");

  const [commitTxHash, setCommitTxHash] = useState<string | null>(null);
  const [linkTxHash, setLinkTxHash] = useState<string | null>(null);

  const [allowMinimize, setAllowMinimize] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  const steps: FlowStep[] = [
    // "connect",
    "commit",
    "waiting",
    "link",
    "complete",
  ];

  useEffect(() => {
    if (!session || !githubUserId) {
      return;
    }

    async function checkLinkStatus() {
      try {
        setIsCheckingLink(true);
        setAllowMinimize(true);
        if (!githubUserId) {
          setIsLinked(false);
          return;
        }
        const linkedAddress = await checkIfGithubLinked({
          githubUserId,
          rpcUrl,
          contractAddress,
        });

        setIsCheckingLink(false);

        if (linkedAddress) {
          setIsLinked(true);
          setLinkedWalletAddress(linkedAddress);
          setCurrentStep("complete");
          setAllowMinimize(true);
        } else {
          setIsLinked(false);
          if (keplrWalletAddress) {
            setCurrentStep("commit");
          } else {
            setCurrentStep("commit");
          }
        }
      } catch (error) {
        setIsCheckingLink(false);
        console.error("Error checking link status:", error);
      }
    }

    checkLinkStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (currentStep !== "waiting" || !commitTxHash) return;

    let intervalId: NodeJS.Timeout | null = null;
    intervalId = setInterval(async () => {
      try {
        const response = await fetch(`${rpcUrl}/tx?hash=0x${commitTxHash}`);
        const data = await response.json();

        if (data.result && data.result.height) {
          clearInterval(intervalId!);
          setCurrentStep("link");
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error checking transaction:", error);
      }
    }, 3000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [currentStep, commitTxHash, rpcUrl]);

  if (!session) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#0A0A0A] p-6 rounded-xl border border-zinc-800"
      >
        <p className="text-teal-100">
          Please connect your GitHub account to proceed with verification.
        </p>
      </motion.div>
    );
  }

  const canMinimize = allowMinimize && !isLinked;
  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-xl bg-[#0A0A0A] shadow-lg border border-zinc-800"
      >
        <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-zinc-500/0 via-zinc-500/50 to-zinc-500/0" />

        {canMinimize && (
          <motion.button
            onClick={() => setIsMinimized(!isMinimized)}
            className="absolute top-2 right-4 z-20 p-2 rounded-md text-slate-300 hover:text-slate-100 hover:bg-zinc-800/30 transition-colors"
          >
            {isMinimized ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </motion.button>
        )}

        <AnimatePresence mode="wait">
          {isMinimized && canMinimize ? (
            <MinimizedStatusBar
              currentStep={currentStep}
              commitTxHash={commitTxHash}
              linkTxHash={linkTxHash}
              truncateHash={truncateHash}
              keplrWalletAddress={keplrWalletAddress}
            />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative z-10 p-6 space-y-8"
            >
              <AnimatePresence mode="wait">
                {isCheckingLink ? (
                  <motion.div
                    initial={{ opacity: 0, height: "auto" }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center justify-center gap-2 text-slate-400"
                  >
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">
                      Checking GitHub connection...
                    </span>
                  </motion.div>
                ) : isLinked ? (
                  <UserLinked
                    githubUserName={session?.user?.name || ""}
                    keplrWalletAddress={linkedWalletAddress}
                  />
                ) : (
                  <GitHubVerificationFlow
                    currentStep={currentStep}
                    steps={steps}
                    isLoading={isLoading}
                    commitTxHash={commitTxHash}
                    keplrWalletAddress={keplrWalletAddress}
                    handleConnectWallet={() =>
                      handleConnectWallet({
                        connectKeplrWallet,
                        setIsLoading,
                        isLinked,
                        setCurrentStep,
                      })
                    }
                    handleCommitStep={() =>
                      handleCommitStep({
                        githubUserId,
                        keplrWalletAddress,
                        rpcUrl,
                        contractAddress,
                        setIsLoading,
                        setCurrentStep,
                        setSecret,
                        setCommitTxHash,
                      })
                    }
                    handleLinkStep={() =>
                      handleLinkStep({
                        secret,
                        keplrWalletAddress,
                        githubToken,
                        rpcUrl,
                        contractAddress,
                        setIsLoading,
                        setLinkTxHash,
                        setIsLinked,
                        setLinkedWalletAddress,
                        setCurrentStep,
                      })
                    }
                  />
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function GitHubVerificationFlow({
  currentStep,
  steps,
  isLoading,
  commitTxHash,
  handleCommitStep,
  handleLinkStep,
  keplrWalletAddress,
}: {
  currentStep: FlowStep;
  steps: FlowStep[];
  isLoading: boolean;
  commitTxHash: string | null;
  handleConnectWallet: () => void;
  handleCommitStep: () => void;
  handleLinkStep: () => void;
  keplrWalletAddress: string | null;
}) {
  return (
    <div className="space-y-8">
      <AnimatePresence>
        {currentStep !== "complete" && (
          <motion.div
            key="github-verification-title"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <h2 className="text-2xl font-bold flex items-center gap-3 text-slate-300">
              <span>GitHub Verification</span>
            </h2>

            <StepProgressBar
              steps={steps}
              currentStep={currentStep || ""}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {currentStep === "commit" && (
          <StepContent
            key="commit"
            icon={<GitCommit className="w-6 h-6 text-emerald-400" />}
            title="Commit github ID"
            description="Securely commit your GitHub identity to the blockchain."
            buttonText={
              keplrWalletAddress
                ? isLoading
                  ? "Committing..."
                  : "Commit GitHub ID"
                : "Connect Wallet first"
            }
            onClick={handleCommitStep}
            isLoading={isLoading}
            buttonStylesCustome={`bg-transparent text-emerald-400 hover:text-emerald-300 border border-emerald-400 ${
              keplrWalletAddress ? "" : "opacity-50 cursor-not-allowed"
            }`}
          />
        )}

        {currentStep === "waiting" && (
          <StepContent
            key="waiting"
            icon={<Signature className="w-6 h-6 text-emerald-400" />}
            title="Processing Transaction"
            description="Please wait while we confirm your transaction..."
            buttonText="Confirming..."
            onClick={() => {}}
            isLoading={true}
            buttonStylesCustome="bg-zinc-900/20 text-zinc-300 ring-1 ring-zinc-700/50"
          >
            {commitTxHash && (
              <motion.a
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                href={`https://neutron.celat.one/pion-1/txs/${commitTxHash}`}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm bg-emerald-500/5 text-emerald-300 px-3 py-1.5 rounded-md ring-1 ring-emerald-500/20"
              >
                View Transaction
                <ExternalLink className="w-4 h-4" />
              </motion.a>
            )}
          </StepContent>
        )}

        {currentStep === "link" && (
          <StepContent
            key="link"
            icon={<LinkIcon className="w-5 h-5 text-emerald-400" />}
            title="Link Account"
            description="Finalize the connection between your GitHub and wallet addresses."
            buttonText={isLoading ? "Linking..." : "Link Account"}
            onClick={handleLinkStep}
            isLoading={isLoading}
            buttonStylesCustome="bg-transparent text-emerald-400 hover:text-emerald-300 border border-emerald-400"
          />
        )}

        {currentStep === "complete" && (
          <CompleteStep
            key="complete"
            githubUserName="(unknown)"
            keplrWalletAddress="(your wallet)"
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function truncateHash(hash: string, start = 6, end = 6): string {
  return `${hash.slice(0, start)}...${hash.slice(-end)}`;
}
