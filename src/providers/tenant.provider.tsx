"use client";
import type { ReactNode } from "react";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import { useTenantWebSocket } from "@/hooks/useTenantWebhook";

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

  return <>{children}</>;
};
