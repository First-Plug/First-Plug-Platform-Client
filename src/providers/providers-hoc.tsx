"use client";

import { type ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "./auth.provider";
import { QueryProvider } from "./query.provider";
import { StoreProvider } from "./store.provider";

interface Props {
  children: ReactNode;
}

export const Providers = ({ children }: Props) => {
  return (
    <SessionProvider>
      <StoreProvider>
        <AuthProvider>
          <QueryProvider>{children}</QueryProvider>
        </AuthProvider>
      </StoreProvider>
    </SessionProvider>
  );
};
