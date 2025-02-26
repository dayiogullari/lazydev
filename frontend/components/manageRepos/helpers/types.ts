export interface ConfigItem {
  labelId: number;
  reward_contract: string;
  reward_config: string;
}

export interface AdminRepo {
  id: number;
  name: string;
  fullName: string;
  url: string;
  description: string;
  createdAt: string;
}

export interface Label {
  id: number;
  name: string;
  color: string;
  description: string;
}

export interface RepoDetails extends AdminRepo {
  labels: Label[];
}
export interface ContractData {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  amountPerReward: string;
}

export interface Session {
  user: {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    githubUsername?: string | null;
  };
  accessToken: string;
}

export interface RepoDetailsProps {
  selectedRepo: RepoDetails;
  deployedContracts: ContractData[];
  onBack: () => void;
  keplrWalletAddress: string;
  session: Session;
}
