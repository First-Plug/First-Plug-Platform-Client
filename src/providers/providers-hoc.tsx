"use client";

import { type ReactNode } from "react";
import { SessionProvider } from "next-auth/react";

import { QueryProvider } from "./query.provider";

interface Props {
  children: ReactNode;
}

export const Providers = ({ children }: Props) => {
  return (
    <SessionProvider>
      <QueryProvider>{children}</QueryProvider>
    </SessionProvider>
  );
};
