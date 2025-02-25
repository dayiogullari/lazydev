import NextAuth from "next-auth";
import { authOptions } from "@/utils/auth";

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
		accessInstallationToken?: string;
	}
	interface Profile {
		login: string;
	}
}

declare module "next-auth/jwt" {
	interface JWT {
		accessToken?: string;
		accessInstallationToken?: string;
		githubUsername?: string;
	}
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
