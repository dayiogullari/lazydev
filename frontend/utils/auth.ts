import NextAuth, { Session } from "next-auth";
import GithubProvider from "next-auth/providers/github";

export const authOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "read:user user:email repo",
        },
      },
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
          githubUsername: profile.login,
        };
      },
    }),
  ],
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, account, profile }: any) {
      if (account) {
        token.accessToken = account.access_token;
      }
      if (profile) {
        token.githubUsername = profile.login;
      }
      return token;
    },
    async session({
      session,
      token,
    }: {
      session: Session;
      token: { accessToken?: string; sub?: string; githubUsername?: string };
    }) {
      session.accessToken = token.accessToken || "";
      session.user = {
        ...session.user,
        id: token.sub,
        githubUsername: token.githubUsername,
      };

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET!,
};

export default NextAuth(authOptions);
