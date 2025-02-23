import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { Providers } from "@/providers/SessionProvider";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "LazyDev",
	description: "Track your open-source contributions!",
};

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await getServerSession(authOptions);

	return (
		<html lang="en">
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<div className="min-h-screen bg-zinc-950">
					<div
						className="fixed inset-0 pointer-events-none"
						style={{
							backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px), 
                             linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)`,
							backgroundSize: `50px 50px`,
						}}
					/>

					<Toaster
						position="bottom-right"
						toastOptions={{
							style: {
								background: "#09090B",
								border: "1px solid #4B5563",
								color: "white",
								padding: "16px",
								borderRadius: "12px",
							},
							duration: 4000,
						}}
					/>

					<Providers session={session}>{children}</Providers>
				</div>
			</body>
		</html>
	);
}
