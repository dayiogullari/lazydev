import React, {
  createContext,
  useState,
  useEffect,
  PropsWithChildren,
} from "react";
import { Keplr } from "@keplr-wallet/provider-extension";
import { TxRaw } from "@keplr-wallet/proto-types/cosmos/tx/v1beta1/tx";
import type { KeplrSignOptions, SignDoc } from "@keplr-wallet/types";
import { BroadcastMode } from "@keplr-wallet/types";
import { chainInfo } from "@/utils/chain-info";

interface KeplrWalletContextInterface {
  keplrWalletAddress: string;
  isKeplrWalletInstalled: boolean;
  connectKeplrWallet: (chainId?: string) => Promise<string>;
  disconnectKeplrWallet: () => void;
  sendTransaction: (
    chainId: string,
    signDoc: SignDoc,
    signOptions?: KeplrSignOptions | undefined
  ) => Promise<string | null>;
}

export const KeplrWalletContext = createContext<KeplrWalletContextInterface>({
  keplrWalletAddress: "",
  isKeplrWalletInstalled: false,
  connectKeplrWallet: async () => "",
  disconnectKeplrWallet: () => {},
  sendTransaction: async () => null,
});

const getKeplrFromProvider = async (): Promise<Keplr | undefined> => {
  try {
    return await Keplr.getKeplr();
  } catch (error) {
    console.error("Error getting Keplr provider:", error);
    return undefined;
  }
};

export const KeplrWalletProvider = ({
  children,
}: PropsWithChildren<object>) => {
  const [keplrWalletAddress, setKeplrWalletAddress] = useState<string>("");
  const [isKeplrWalletInstalled, setIsKeplrWalletInstalled] =
    useState<boolean>(false);

  useEffect(() => {
    const checkKeplrInstalled = async () => {
      const keplr = await getKeplrFromProvider();
      setIsKeplrWalletInstalled(!!keplr);
    };

    checkKeplrInstalled();
  }, []);

  const connectKeplrWallet = async (
    chainId: string = "pion-1"
  ): Promise<string> => {
    try {
      const keplr = await getKeplrFromProvider();

      if (!keplr) {
        throw new Error("Keplr extension is not installed");
      }

      if (window.keplr) {
        await window.keplr.experimentalSuggestChain(chainInfo);
      } else {
        throw new Error("Keplr extension is not installed");
      }

      await keplr.enable(chainId);

      const offlineSigner = keplr.getOfflineSigner(chainId);
      const accounts = await offlineSigner.getAccounts();

      if (accounts.length === 0) {
        throw new Error("No accounts found in Keplr");
      }

      const address = accounts[0].address;
      setKeplrWalletAddress(address);

      return address;
    } catch (error) {
      console.error("Error connecting to Keplr wallet:", error);
      return "";
    }
  };

  const disconnectKeplrWallet = () => {
    setKeplrWalletAddress("");
  };

  const sendTransaction = async (
    chainId: string,
    signDoc: SignDoc,
    signOptions?: KeplrSignOptions | undefined
  ): Promise<string | null> => {
    try {
      const keplr = await getKeplrFromProvider();

      if (!keplr) {
        throw new Error("Keplr extension is not installed");
      }

      if (!keplrWalletAddress) {
        throw new Error("Wallet not connected. Please connect wallet first.");
      }

      const protoSignResponse = await keplr.signDirect(
        chainId,
        keplrWalletAddress,
        signDoc,
        signOptions
      );

      const protobufTx = TxRaw.encode({
        bodyBytes: protoSignResponse.signed.bodyBytes,
        authInfoBytes: protoSignResponse.signed.authInfoBytes,
        signatures: [
          Buffer.from(protoSignResponse.signature.signature, "base64"),
        ],
      }).finish();

      const txResponse = await keplr.sendTx(
        chainId,
        protobufTx,
        BroadcastMode.Block
      );
      const txHash = Array.from(txResponse)
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");

      return txHash;
    } catch (error) {
      if (error instanceof Error) {
        console.error("Failed to broadcast transaction:", error.message);
      } else {
        console.error("Failed to broadcast transaction:", error);
      }
      return null;
    }
  };

  return (
    <KeplrWalletContext.Provider
      value={{
        keplrWalletAddress,
        isKeplrWalletInstalled,
        connectKeplrWallet,
        disconnectKeplrWallet,
        sendTransaction,
      }}
    >
      {children}
    </KeplrWalletContext.Provider>
  );
};

export const useKeplrWallet = () => React.useContext(KeplrWalletContext);
