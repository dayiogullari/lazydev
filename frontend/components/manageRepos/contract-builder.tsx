import { useEffect, useState } from "react";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { Decimal } from "@cosmjs/math";
import { motion } from "framer-motion";

import { useKeplrWallet } from "@/providers/kepler-context";
import { Copy, ExternalLink, Loader2, Rocket } from "lucide-react";
import Link from "next/link";

interface ContractData {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  amountPerReward: string;
}

const ContractBuilder = () => {
  const { keplrWalletAddress } = useKeplrWallet();
  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    decimals: "6",
    amountPerReward: "",
  });
  const [deploying, setDeploying] = useState(false);
  const [deployedContracts, setDeployedContracts] = useState<ContractData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("deployedContracts");
    if (stored) {
      try {
        setDeployedContracts(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse stored contracts:", e);
        localStorage.removeItem("deployedContracts");
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeploying(true);
    setError(null);

    try {
      const offlineSigner = window.getOfflineSigner?.("pion-1");
      if (!offlineSigner) throw new Error("No signer available");

      const signingClient = await SigningCosmWasmClient.connectWithSigner(
        "https://rpc.pion.rs-testnet.polypore.xyz",
        offlineSigner,
        {
          gasPrice: {
            denom: "untrn",
            amount: Decimal.fromUserInput("0.025", 3),
          },
        },
      );

      const instantiateMsg = {
        config: {
          name: formData.name,
          symbol: formData.symbol,
          decimals: parseInt(formData.decimals),
          cw20_base_code_id: 10880,
        },
        lazydev_address: "neutron17763lnw3wp74zg8etdpultvj2sysx2qrsv0hwrjay3dwyyd9uqyqhcxr86",
      };

      const result = await signingClient.instantiate(
        keplrWalletAddress,
        10893,
        instantiateMsg,
        "lazydev-token-minter",
        "auto",
      );

      const newContract: ContractData = {
        address: result.contractAddress,
        name: formData.name,
        symbol: formData.symbol,
        decimals: parseInt(formData.decimals),
        amountPerReward: formData.amountPerReward,
      };

      const updatedContracts = [...deployedContracts, newContract];
      setDeployedContracts(updatedContracts);
      localStorage.setItem("deployedContracts", JSON.stringify(updatedContracts));

      setFormData({
        name: "",
        symbol: "",
        decimals: "6",
        amountPerReward: "",
      });
    } catch (error) {
      console.error("Contract deployment failed:", error);
      setError(error instanceof Error ? error.message : "Contract deployment failed");
    } finally {
      setDeploying(false);
    }
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-zinc-800 bg-[#0A0A0A] p-6 shadow-lg"
      >
        {error && (
          <div className="mb-4 p-4 rounded-lg bg-red-900/20 border border-red-900 text-red-400">
            {error}
          </div>
        )}
        <div className="space-y-6">
          <div className="border-b border-zinc-800 pb-4">
            <h2 className="text-2xl font-semibold text-green-400">Create New Token Contract</h2>
            <p className="mt-1 text-sm text-zinc-400">Configure your token parameters below</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Token Name</label>
                <input
                  className="w-full px-4 py-3 rounded-lg bg-[#09090B] text-zinc-200 border border-zinc-800 focus:border-green-400/50  focus:outline-none focus:ring-0 transition-all "
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="My Token"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Token Symbol</label>
                <input
                  className="w-full px-4 py-3 rounded-lg bg-[#09090B] text-zinc-200 border border-zinc-800 focus:border-green-400/50  focus:outline-none focus:ring-0 transition-all"
                  value={formData.symbol}
                  onChange={(e) => setFormData((prev) => ({ ...prev, symbol: e.target.value }))}
                  placeholder="MTK"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Decimals</label>
                <input
                  type="number"
                  className="w-full px-4 py-3 rounded-lg bg-[#09090B] text-zinc-200 border border-zinc-800 focus:border-green-400/50  focus:outline-none focus:ring-0 transition-all"
                  value={formData.decimals}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      decimals: e.target.value,
                    }))
                  }
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={deploying}
              className="w-full py-3 px-6 rounded-lg bg-[#09090B] text-[#c1c1c7] hover:bg-zinc-700 transition-colors border border-zinc-800 flex items-center justify-center gap-2"
            >
              {deploying ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Deploying Contract...</span>
                </>
              ) : (
                <>
                  <Rocket className="w-5 h-5" />
                  <span>Deploy Token</span>
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>

      {deployedContracts.length > 0 && (
        <div className="space-y-6">
          <div className="border-b border-zinc-800 pb-4">
            <h2 className="text-2xl font-semibold text-green-400">
              <span className="bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
                Configured Contracts
              </span>
            </h2>
            <p className="mt-1 text-sm text-zinc-400">Previously deployed token contracts</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deployedContracts.map((contract, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative rounded-xl border border-zinc-800 bg-[#0A0A0A] p-6 shadow-lg hover:border-green-400/30 transition-colors"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-zinc-200">
                      {contract.name}
                      <span className="ml-2 text-green-400">({contract.symbol})</span>
                    </h3>
                    <Link
                      href={`https://neutron.celat.one/pion-1/contracts/${contract.address}`}
                      target="_blank"
                    >
                      <ExternalLink className="w-4 h-4 text-green-400 hover:text-green-500 transition-colors" />
                    </Link>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-zinc-400">Address:</span>
                      <span className="text-zinc-300 font-mono truncate">{contract.address}</span>
                      <button
                        onClick={() => navigator.clipboard.writeText(contract.address)}
                        className="text-zinc-500 hover:text-green-400 transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-zinc-400">Decimals:</span>
                      <span className="text-zinc-300">{contract.decimals}</span>
                    </div>
                  </div>
                </div>

                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-green-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractBuilder;
