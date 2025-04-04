import { filteredRepos } from "./filtered-repos";
import { contract_address, rpc_url } from "./consts";
import { toHex } from "@cosmjs/encoding";
import { Comet38Client } from "@cosmjs/tendermint-rpc";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";

interface GitHubItem {
  repository_url: string;
  html_url: string;
  created_at: string;
  title: string;
  state: string;
}
export interface Contribution {
  prUrl: string;
  repo: string;
  date: string;
  description: string;
  claimed?: boolean;
  rewards?: TokenRewardInfo[];
  txHash?: string;
  loading?: boolean;
}

export type TokenRewardInfo = {
  rewardAddress: string;
  rewardToken: string;
  rewardAmount: number;
};

async function checkIfPrClaimed(
  org: string,
  repo: string,
  prNumber: string
): Promise<{
  claimed: boolean;
  rewards?: TokenRewardInfo[];
  txHash?: string;
}> {
  try {
    const cosmWasmClient = await CosmWasmClient.connect(rpc_url);
    const cometClient = await Comet38Client.connect(rpc_url);

    const response = await cometClient.txSearch({
      query: `wasm-pr_reward._contract_address='${contract_address}' AND wasm-pr_reward.org='${org}' AND wasm-pr_reward.repo='${repo}' AND wasm-pr_reward.pr=${prNumber}`,
      order_by: "desc",
    });

    // console.log(
    //   `wasm-pr_reward._contract_address='${contract_address}' AND wasm-pr_reward.org='${org}' AND wasm-pr_reward.repo='${repo}' AND wasm-pr_reward.pr=${prNumber}`
    // );

    if (!response) {
      throw new Error(`Blockchain query failed: ${response}`);
    }

    console.log(response);

    if (response && response.totalCount > 0) {
      let allRewards: TokenRewardInfo[] = [];
      const tx = response.txs[0];

      const rewardEvent = tx.result.events.filter(
        (event) => event.type === "wasm-reward"
      );

      for (const event of rewardEvent) {
        const rewardAttr = event.attributes.find(
          (attr) => attr.key === "reward"
        );

        if (rewardAttr) {
          try {
            const rewardData = JSON.parse(rewardAttr.value);
            const tokenInfo = await cosmWasmClient.queryContractSmart(
              rewardData.token.denom,
              {
                token_info: {},
              }
            );
            const reward_p = {
              rewardAddress: rewardData.token.denom,
              rewardToken: tokenInfo.symbol,
              rewardAmount: rewardData.token.amount,
            };
            const idx = allRewards.findIndex(
              (reward) => reward.rewardAddress == reward_p.rewardAddress
            );

            if (idx < 0) {
              allRewards = [...allRewards, reward_p];
            } else {
              allRewards[idx] = {
                ...allRewards[idx],
                rewardAmount:
                  Number(allRewards[idx].rewardAmount) +
                  Number(reward_p.rewardAmount),
              };
            }
          } catch (error) {
            console.log(error);
            return { claimed: true, txHash: toHex(tx.hash) };
          }
        }
      }

      return {
        claimed: true,
        rewards: allRewards,
        txHash: toHex(tx.hash),
      };
    } else {
      return { claimed: false };
    }
  } catch (error) {
    console.error("Error checking PR claim status:", error);
    return { claimed: false };
  }
}

function extractPrNumber(url: string): string {
  const parts = url.split("/");
  return parts[parts.length - 1];
}

export async function getGithubContributions(
  username: string,
  onProgressCallback?: (contribution: Contribution) => void
) {
  try {
    const repos = await filteredRepos(rpc_url, contract_address);

    let data;
    if (repos.length !== 0) {
      const repoQueryString = repos
        .map(({ org, repo }) => `repo:${org}/${repo}`)
        .join("+");

      const response = await fetch(
        `https://api.github.com/search/issues?q=author:${username}+is:pr+is:closed+${repoQueryString}`
      );

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      data = await response.json();
    } else {
      data = { items: [] };
    }

    const contributions: Contribution[] = [];

    for (const item of data.items) {
      const [org, repoId] = item.repository_url.split("/").slice(-2);

      const initialContribution = {
        repo: `${org}/${repoId}`,
        prUrl: item.html_url,
        date: item.created_at,
        description: item.title,
        status: item.state,
        org,
        repoId,
        loading: true,
      };

      contributions.push(initialContribution);

      if (onProgressCallback) {
        onProgressCallback(initialContribution);
      }
    }

    const updatePromises: Promise<void>[] = data.items.map(
      async (item: GitHubItem, index: number) => {
        const [org, repoId] = item.repository_url.split("/").slice(-2);
        const prNumber = extractPrNumber(item.html_url);

        try {
          const claimStatus = await checkIfPrClaimed(org, repoId, prNumber);
          console.log("ASDLAJSLDLAJKSJLKDAS", claimStatus);
          contributions[index] = {
            ...contributions[index],
            claimed: claimStatus.claimed,
            txHash: claimStatus.txHash,
            rewards: claimStatus.rewards,
            loading: false,
          };

          if (onProgressCallback) {
            onProgressCallback(contributions[index]);
          }
        } catch (error) {
          console.error(
            `Error checking claim status for PR ${prNumber}:`,
            error
          );
          contributions[index] = {
            ...contributions[index],
            loading: false,
          };

          if (onProgressCallback) {
            onProgressCallback(contributions[index]);
          }
        }
      }
    );

    await Promise.all(updatePromises);

    return contributions;
  } catch (error) {
    console.error("Error fetching PRs from GitHub:", error);
    return [];
  }
}
