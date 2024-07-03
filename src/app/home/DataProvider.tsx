"use client";
import { setAuthInterceptor } from "@/config/axios.config";
import { useStore } from "@/models";
import { useSession } from "next-auth/react";
import { Fragment, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AuthServices } from "@/services";
interface DataProvidersProps {
  children: ReactNode;
}

export default function DataProvider({ children }: DataProvidersProps) {
  const session = useSession();
  const {
    user: { setUser },
  } = useStore();

  const router = useRouter();
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

  return <Fragment>{children}</Fragment>;
}
