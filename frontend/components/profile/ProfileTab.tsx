"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { Session } from "next-auth";
import ShareProfileButton from "@/components/ShareProfileButton";

export function ProfileTab({ session }: { session: Session | null }) {
	return (
		<motion.div
			key="profile"
			initial="hidden"
			animate="visible"
			exit="exit"
			transition={{ duration: 0.2 }}
			className="space-y-8"
		>
			<div className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-6">
				<h2 className="text-xl font-bold mb-6">Profile</h2>
				{session?.user ? (
					<div className="flex items-center gap-4">
						<Image
							src={session.user.image || "/placeholder-user.jpg"}
							alt={`Avatar of ${session.user.name || "User"}`}
							width={60}
							height={60}
							className="rounded-full"
						/>
						<div>
							<p className="text-lg font-medium">
								{session.user.name || "No Name"}
							</p>
							<p className="text-gray-400 text-sm">{session.user.email}</p>
							{session.user.githubUsername && (
								<p className="text-gray-500 text-sm mt-1">
									GitHub: {session.user.githubUsername}
								</p>
							)}
						</div>
					</div>
				) : (
					<p className="text-gray-400">
						You need to sign in to see your profile.
					</p>
				)}
			</div>
			<div className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-6">
				<ShareProfileButton />
			</div>
		</motion.div>
	);
}
