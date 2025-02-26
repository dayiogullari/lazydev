import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getServerSession } from "next-auth/next";
import { Providers } from "@/providers/session-provider";
import { Toaster } from "react-hot-toast";
import { authOptions } from "@/utils/auth";
import React from "react";

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
  description: "get paid for your open-source contributions!",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="overflow-x-hidden min-h-screen bg-zinc-950">
          <div
            aria-hidden="true"
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

          <Providers session={session}>
            <React.Suspense fallback={<div>Loading...</div>}></React.Suspense>
            <div className="relative z-10">{children}</div>
          </Providers>
        </div>
      </body>
    </html>
  );
}
