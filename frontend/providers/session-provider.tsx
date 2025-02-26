"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { Session } from "next-auth";
import { KeplrWalletProvider } from "./kepler-context";

interface Props {
  children: ReactNode;
  session: Session | null;
}

export function Providers({ children, session }: Props) {
  return (
    <SessionProvider session={session}>
      <KeplrWalletProvider>{children}</KeplrWalletProvider>
    </SessionProvider>
  );
}
