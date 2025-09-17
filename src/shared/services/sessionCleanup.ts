"use client";

import { signOut } from "next-auth/react";

/**
 * Limpia caches persistidas y tokens, y desloguea al usuario.
 * No depende del QueryClient en memoria; al recargar, se crea uno nuevo.
 */
export const cleanupAndSignOut = async (options?: { callbackUrl?: string }) => {
  try {
    if (typeof window !== "undefined") {
      window.localStorage.clear();
      sessionStorage.clear();
    }
  } finally {
    await signOut({
      redirect: true,
      callbackUrl: options?.callbackUrl ?? "/login",
    });
  }
};
