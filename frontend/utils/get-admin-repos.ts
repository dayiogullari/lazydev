interface GithubRepo {
	id: number;
	name: string;
	full_name: string;
	html_url: string;
	description: string;
	created_at: string;
	private: boolean;
	permissions: {
		admin: boolean;
	};
}
export async function getAdminRepos(accessToken: string) {
	try {
		const response = await fetch(`https://api.github.com/user/repos`, {
			headers: {
				Accept: "application/vnd.github.v3+json",
				Authorization: `Bearer ${accessToken}`,
			},
		});

		if (!response.ok) {
			throw new Error(`GitHub API error: ${response.status}`);
		}

		const repos: GithubRepo[] = await response.json();
		return repos.filter((repo) => !repo.private && repo.permissions?.admin);
	} catch (error) {
		console.error("Error fetching admin repos:", error);
		return [];
	}
}
