import { motion } from "framer-motion";
import { CheckCircle, Github, Wallet } from "lucide-react";

interface CompleteStepProps {
  githubUserName?: string;
  keplrWalletAddress: string;
  children?: React.ReactNode;
}

export function CompleteStep({
  githubUserName,
  keplrWalletAddress,
  children,
}: CompleteStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="py-8"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 15,
        }}
        className="relative mx-auto w-24 h-24 mb-8"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1.2, opacity: 0 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: 0.2,
          }}
          className="absolute inset-0 rounded-full bg-green-500/20"
        />

        <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-full flex items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
              delay: 0.1,
            }}
          >
            <CheckCircle className="w-12 h-12 text-green-400" />
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-6 text-center"
      >
        <div className="space-y-2">
          <h3 className="text-2xl font-semibold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
            Verification Complete!
          </h3>
          <p className="text-slate-400 text-sm">
            Your GitHub identity is now cryptographically linked to your wallet
            address.
          </p>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex  items-center gap-4 mx-auto"
        >
          <div className="w-full p-3 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-800 rounded-lg">
                <Github className="w-5 h-5 text-slate-300" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-xs text-slate-400 font-medium">GitHub</div>
                <div className="text-sm text-slate-200 font-medium truncate">
                  {githubUserName || "GitHub User"}
                </div>
              </div>
            </div>
          </div>

          <div className="h-8 flex items-center">
            <motion.div className="text-green-400">
              <svg
                width="20"
                height="8"
                viewBox="0 0 20 8"
                fill="none"
              >
                <path
                  d="M19.3536 4.35355C19.5488 4.15829 19.5488 3.84171 19.3536 3.64645L16.1716 0.464466C15.9763 0.269204 15.6597 0.269204 15.4645 0.464466C15.2692 0.659728 15.2692 0.976311 15.4645 1.17157L18.2929 4L15.4645 6.82843C15.2692 7.02369 15.2692 7.34027 15.4645 7.53553C15.6597 7.7308 15.9763 7.7308 16.1716 7.53553L19.3536 4.35355ZM0 4.5H19V3.5H0V4.5Z"
                  fill="currentColor"
                />
              </svg>
            </motion.div>
          </div>

          <div className="w-full p-3 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-800 rounded-lg">
                <Wallet className="w-5 h-5 text-slate-300" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-xs text-slate-400 font-medium">
                  Keplr Wallet
                </div>
                <div className="text-sm font-mono text-slate-200 truncate">
                  {keplrWalletAddress?.substring(0, 8)}...
                  {keplrWalletAddress?.substring(keplrWalletAddress.length - 6)}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="pt-2"
        >
          {children}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
