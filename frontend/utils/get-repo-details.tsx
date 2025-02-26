interface Label {
  id: number;
  name: string;
  color: string;
  description: string;
}

interface RepoDetails {
  id: number;
  name: string;
  fullName: string;
  url: string;
  description: string;
  createdAt: string;
  labels: Label[];
}

export async function getRepoDetails(repoId: number, accessToken: string): Promise<RepoDetails> {
  try {
    const repoResponse = await fetch(`https://api.github.com/repositories/${repoId}`, {
      headers: {
        Authorization: `token ${accessToken}`,
      },
    });

    if (!repoResponse.ok) {
      throw new Error("Failed to fetch repository");
    }

    const repoData = await repoResponse.json();

    const labelsResponse = await fetch(`https://api.github.com/repositories/${repoId}/labels`, {
      headers: {
        Authorization: `token ${accessToken}`,
      },
    });

    if (!labelsResponse.ok) {
      throw new Error("Failed to fetch labels");
    }

    const labels = await labelsResponse.json();

    return {
      id: repoData.id,
      name: repoData.name,
      fullName: repoData.full_name,
      url: repoData.html_url,
      description: repoData.description,
      createdAt: repoData.created_at,
      labels: labels,
    };
  } catch (error) {
    console.error("Error fetching repo details:", error);
    throw error;
  }
}
