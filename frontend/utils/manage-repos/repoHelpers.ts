import { getAdminRepos } from "@/utils/get-admin-repos";
import { getRepoDetails } from "@/utils/get-repo-details";

interface Label {
  id: number;
  name: string;
  color: string;
  description: string;
}

interface RepoDetails extends AdminRepo {
  labels: Label[];
}

interface AdminRepo {
  id: number;
  name: string;
  fullName: string;
  url: string;
  description: string;
  createdAt: string;
}

export interface PaginationInfo {
  page: number;
  perPage: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export const fetchAdminRepos = async (
  accessToken: string,
  page: number = 1,
  perPage: number = 100
): Promise<{ repos: AdminRepo[]; pagination: PaginationInfo }> => {
  const response = await getAdminRepos(accessToken, page, perPage);

  const githubRepos = response.data || [];

  const paginationInfo = response.pagination || {
    page,
    perPage,
    totalCount: githubRepos.length,
    hasNextPage: false,
    hasPreviousPage: page > 1,
  };

  const repos = githubRepos.map((repo) => ({
    id: repo.id,
    name: repo.name,
    fullName: repo.full_name,
    url: repo.html_url,
    description: repo.description,
    createdAt: repo.created_at,
  }));

  return {
    repos,
    pagination: paginationInfo,
  };
};

export const fetchRepoDetails = async (
  repoId: number,
  accessToken: string
): Promise<RepoDetails> => {
  return await getRepoDetails(repoId, accessToken);
};
