import { FilteredRepos } from "./filtered-repos";

interface Contribution {
	repo: string;
	prUrl: string;
	date: string;
	description: string;
	status: string;
	org: string;
	repoId: string;
}

export async function getGithubContributions(username: string) {
	try {
		const repos = await FilteredRepos(
			"https://rpc.pion.rs-testnet.polypore.xyz",
			"neutron17763lnw3wp74zg8etdpultvj2sysx2qrsv0hwrjay3dwyyd9uqyqhcxr86",
		);
		const repoQueryString = repos
			.map(({ org, repo }) => `repo:${org}/${repo}`)
			.join("+");

		const response = await fetch(
			`https://api.github.com/search/issues?q=author:${username}+is:pr+is:closed+${repoQueryString}`,
		);
		if (!response.ok) {
			throw new Error(`GitHub API error: ${response.status}`);
		}

		const data = await response.json();

		const contributions: Contribution[] = data.items.map(
			(item: {
				repository_url: string;
				html_url: string;
				created_at: string;
				title: string;
				state: string;
			}) => {
				const [org, repoId] = item.repository_url.split("/").slice(-2);
				return {
					repo: `${org}/${repoId}`,
					prUrl: item.html_url,
					date: item.created_at,
					description: item.title,
					status: item.state,
					org,
					repoId,
				};
			},
		);

		return contributions;
	} catch (error) {
		console.error("Error fetching PRs from GitHub:", error);
		return [];
	}
}
