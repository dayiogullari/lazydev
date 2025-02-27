import { LazydevQueryClient } from "@/ts/lazydev/Lazydev.client";
import { NullableCommitmentForAddr } from "@/ts/lazydev/Lazydev.types";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";

export async function checkIfGithubLinked({
  githubUserId,
  rpcUrl,
  contractAddress,
}: {
  githubUserId: number;
  rpcUrl: string;
  contractAddress: string;
}): Promise<NullableCommitmentForAddr | string | null> {
  if (!githubUserId) return null;

  const client = await CosmWasmClient.connect(rpcUrl);
  const lazydevQueryClient = new LazydevQueryClient(client, contractAddress);

  const LinkedResult = await lazydevQueryClient.linkedAddress({ githubUserId });

  if (typeof LinkedResult === "string" && LinkedResult.length > 0) {
    return LinkedResult;
  }

  const CommitedResult = await lazydevQueryClient.userCommitment({
    githubUserId,
  });

  if (CommitedResult === null) {
    return null;
  }

  return CommitedResult;
}
