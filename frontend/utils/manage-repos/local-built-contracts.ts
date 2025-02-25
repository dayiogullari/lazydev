interface ContractData {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  amountPerReward: string;
}

export const getDeployedContracts = (): ContractData[] => {
  const contracts = localStorage.getItem("deployedContracts");
  if (contracts) {
    try {
      return JSON.parse(contracts);
    } catch (error) {
      console.error("Failed to parse stored contracts:", error);
      localStorage.removeItem("deployedContracts");
    }
  }
  return [];
};

export const setDeployedContracts = (contracts: ContractData[]) => {
  localStorage.setItem("deployedContracts", JSON.stringify(contracts));
};
