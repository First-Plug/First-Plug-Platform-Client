"use client";

import { type ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { AuthProvider, QueryProvider, StoreProvider } from "@/providers";

interface Props {
  children: ReactNode;
}

export default function Providers({ children }: Props) {
  return (
    <SessionProvider>
      <StoreProvider>
        <AuthProvider>
          <QueryProvider>{children}</QueryProvider>
        </AuthProvider>
      </StoreProvider>
    </SessionProvider>
  );
}
