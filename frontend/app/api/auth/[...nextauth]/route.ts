import NextAuth from "next-auth";
import GithubProvider, { GithubProfile } from "next-auth/providers/github";
import { NextAuthOptions } from "next-auth";

declare module "next-auth" {
	interface Session {
		user: {
			id?: string | null;
			name?: string | null;
			email?: string | null;
			image?: string | null;
			githubUsername?: string | null;
		};
		accessToken: string;
	}
	interface Profile {
		login: string;
	}
}
declare module "next-auth/jwt" {
	interface JWT {
		githubUsername?: string;
	}
}

export const authOptions: NextAuthOptions = {
	providers: [
		GithubProvider({
			clientId: process.env.GITHUB_ID!,
			clientSecret: process.env.GITHUB_SECRET!,
			profile(profile: GithubProfile) {
				return {
					id: profile.id.toString(),
					name: profile.name ?? profile.login,
					email: profile.email,
					image: profile.avatar_url,
					githubUsername: profile.login,
				};
			},
		}),
	],
	secret: process.env.NEXTAUTH_SECRET,

	callbacks: {
		async jwt({ token, account, profile }) {
			if (account) {
				token.accessToken = account.access_token;
			}
			if (profile) {
				token.githubUsername = (profile as GithubProfile).login;
			}
			return token;
		},
		async session({ session, token }) {
			if (token.githubUsername) {
				session.user.githubUsername = token.githubUsername as string;
			}
			session.user.id = token.sub;
			session.accessToken = token.accessToken as string;
			return session;
		},
	},
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
