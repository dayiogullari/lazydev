import { NextAuthOptions, Session } from "next-auth";
import { createAppAuth } from "@octokit/auth-app";

interface ExtendedSession extends Session {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    id: string;
    githubUsername?: string;
  };
  accessToken: string;
  accessInstallationToken: string;
  expires: string;
}

async function getInstallationToken() {
  const auth = createAppAuth({
    appId: process.env.GITHUB_APP_ID!,
    privateKey: process.env.GITHUB_APP_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    clientId: process.env.GITHUB_APP_CLIENT_ID!,
    clientSecret: process.env.GITHUB_APP_CLIENT_SECRET!,
  });

  const { token, expiresAt } = await auth({
    type: "installation",
    installationId: process.env.GITHUB_APP_INSTALLATION_ID!,
  });

  return { token, expiresAt };
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    {
      id: "github",
      name: "GitHub",
      type: "oauth",
      authorization: {
        url: "https://github.com/login/oauth/authorize",
        params: {
          scope: "read:user user:email repo",
          installation_id: process.env.GITHUB_APP_INSTALLATION_ID,
        },
      },
      token: "https://github.com/login/oauth/access_token",
      userinfo: {
        url: "https://api.github.com/user",
        async request(context) {
          const res = await fetch("https://api.github.com/user", {
            headers: {
              Authorization: `Bearer ${context.tokens.access_token}`,
              Accept: "application/vnd.github.v3+json",
              "User-Agent": "My-GitHub-App",
            },
          });

          if (!res.ok) {
            throw new Error("Failed to fetch user");
          }

          return res.json();
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
      clientId: process.env.GITHUB_APP_CLIENT_ID!,
      clientSecret: process.env.GITHUB_APP_CLIENT_SECRET!,
    },
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account?.access_token) {
        token.accessToken = account.access_token;
        token.accessTokenExpires =
          Date.now() + ((account.expires_in as number) ?? 3600) * 1000;
      }

      if (profile) {
        token.githubUsername = profile.login;
      }
      const now = Date.now();
      const installationTokenExpires =
        (token.accessInstallationTokenExpires as number) ?? 0;

      if (
        !token.accessInstallationToken ||
        now + 300000 > installationTokenExpires
      ) {
        try {
          const { token: installationToken, expiresAt } =
            await getInstallationToken();
          token.accessInstallationToken = installationToken;
          token.accessInstallationTokenExpires = new Date(expiresAt).getTime();
        } catch (error) {
          console.error("Failed to refresh installation token:", error);
          if (!token.accessInstallationToken) {
            throw error;
          }
        }
      }

      return token;
    },
    async session({ session, token }): Promise<ExtendedSession> {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub!,
          githubUsername: token.githubUsername as string,
        },
        accessToken: token.accessToken as string,
        accessInstallationToken: token.accessInstallationToken as string,
        expires: new Date(
          token.accessInstallationTokenExpires as number
        ).toISOString(),
      };
    },
  },
};
