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

export const fetchAdminRepos = async (
	accessToken: string,
): Promise<AdminRepo[]> => {
	const githubRepos = await getAdminRepos(accessToken);
	return githubRepos.map((repo) => ({
		id: repo.id,
		name: repo.name,
		fullName: repo.full_name,
		url: repo.html_url,
		description: repo.description,
		createdAt: repo.created_at,
	}));
};

export const fetchRepoDetails = async (
	repoId: number,
	accessToken: string,
): Promise<RepoDetails> => {
	return await getRepoDetails(repoId, accessToken);
};
