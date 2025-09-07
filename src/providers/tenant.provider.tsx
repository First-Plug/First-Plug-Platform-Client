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

  useTenantWebSocket(session.data?.user?.tenantName || "superadmin");

  if (!session.data) return null;

  // Verificar si es usuario admin (por email o por role)
  const userEmail = session.data?.user?.email;
  const userRole = session.data?.user?.role;
  const adminEmails = ["hola@firstplug.com", "superadmin@mail.com"];
  const isLogisticUser = adminEmails.includes(userEmail);
  const isSuperAdmin = userRole === "superadmin";

  // Solo redirigir a waiting si NO es admin y NO tiene tenant
  if (!session.data.user.tenantName && !isLogisticUser && !isSuperAdmin) {
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
