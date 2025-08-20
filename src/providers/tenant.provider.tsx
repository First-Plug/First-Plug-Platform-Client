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

  const accessToken = session.data.backendTokens?.accessToken;
  if (accessToken) {
    sessionStorage.setItem("accessToken", accessToken);
    setAuthInterceptor(accessToken);
  }

  return <>{children}</>;
};
