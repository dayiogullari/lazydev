import { LazydevQueryClient } from "@/ts/lazydev/Lazydev.client";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";

export async function checkIfGithubLinked({
	githubUserId,
	rpcUrl,
	contractAddress,
}: {
	githubUserId: number;
	rpcUrl: string;
	contractAddress: string;
}): Promise<string | null> {
	if (!githubUserId) return null;

	const client = await CosmWasmClient.connect(rpcUrl);
	const lazydevQueryClient = new LazydevQueryClient(client, contractAddress);

	const result = await lazydevQueryClient.linkedAddress({ githubUserId });

	if (typeof result === "string" && result.length > 0) {
		return result;
	}
	return null;
}
