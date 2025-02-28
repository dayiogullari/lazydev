import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { ArrayOfRepo } from "@/ts/lazydev/Lazydev.types";
import { LazydevQueryClient } from "@/ts/lazydev/Lazydev.client";

export async function filteredRepos(rpcUrl: string, contractAddress: string): Promise<ArrayOfRepo> {
  const client = await CosmWasmClient.connect(rpcUrl);

  const repos = await new LazydevQueryClient(client, contractAddress).repos();
  return repos;
}
