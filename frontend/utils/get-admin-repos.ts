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

type SortField = "created" | "updated" | "pushed" | "full_name";
type SortDirection = "asc" | "desc";

export async function getAdminRepos(
  accessToken: string,
  page: number = 1,
  perPage: number = 100,
  sort: SortField = "updated",
  direction: SortDirection = "desc",
) {
  try {
    const response = await fetch(
      `https://api.github.com/user/repos?per_page=${perPage}&page=${page}&sort=${sort}&direction=${direction}`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          Authorization: `token ${accessToken}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const repos: GithubRepo[] = await response.json();
    const filteredRepos = repos.filter((repo) => !repo.private && repo.permissions?.admin);

    const linkHeader = response.headers.get("link") || "";
    const hasNextPage = linkHeader.includes('rel="next"');
    const hasPreviousPage = linkHeader.includes('rel="prev"');

    const totalCount = parseInt(response.headers.get("x-total-count") || "0", 10);

    return {
      data: filteredRepos,
      headers: {
        link: linkHeader,
        "x-total-count": totalCount || filteredRepos.length,
      },
      pagination: {
        page,
        perPage,
        totalCount: totalCount || filteredRepos.length,
        hasNextPage,
        hasPreviousPage,
      },
    };
  } catch (error) {
    console.error("Error fetching admin repos:", error);
    return {
      data: [],
      headers: {},
      pagination: {
        page,
        perPage,
        totalCount: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  }
}
