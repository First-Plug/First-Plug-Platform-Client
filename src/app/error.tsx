"use client";

import { useEffect } from "react";
import { cleanupAndSignOut } from "@/shared/services/sessionCleanup";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    cleanupAndSignOut();
  }, [error]);

  return null;
}
