"use client";
import type { ReactNode } from "react";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import { useTenantWebSocket } from "@/shared/hooks/useTenantWebhook";
import { setAuthInterceptor } from "@/config/axios.config";

interface Props {
  children: ReactNode;
}

export const TenantProvider = ({ children }: Props) => {
  const session = useSession();
  const router = useRouter();

  useTenantWebSocket(session.data?.user?.tenantName);

  if (!session.data) return null;
  if (!session.data.user.tenantName) {
    router.push("/waiting");
    return;
  }

  sessionStorage.setItem("accessToken", session.data.backendTokens.accessToken);
  if (sessionStorage.getItem("accessToken")) {
    setAuthInterceptor(sessionStorage.getItem("accessToken"));
  }

  return <>{children}</>;
};
