"use client";
import type { ReactNode } from "react";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import { useTenantWebSocket } from "@/hooks/useTenantWebhook";
import { setAuthInterceptor } from "@/config/axios.config";
import { AuthServices } from "@/services";
import { useStore } from "@/models";

interface Props {
  children: ReactNode;
}

export const TenantProvider = ({ children }: Props) => {
  const session = useSession();
  const router = useRouter();
  const {
    user: { setUser },
  } = useStore();
  useTenantWebSocket(session.data?.user?.tenantName);

  if (!session.data) return null;
  if (!session.data.user.tenantName) {
    router.push("/waiting");
    return;
  }

  sessionStorage.setItem("accessToken", session.data.backendTokens.accessToken);
  if (sessionStorage.getItem("accessToken")) {
    setAuthInterceptor(sessionStorage.getItem("accessToken"));
    AuthServices.getUserInfro(session.data.user._id).then((res) => {
      setUser(res);
    });
  }

  return <>{children}</>;
};
