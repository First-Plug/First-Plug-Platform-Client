"use client";
import { EmptyCard, EmptyCardLayout } from "@/common";
import { setAuthInterceptor } from "@/config/axios.config";
import { useStore } from "@/models";
import { observer } from "mobx-react-lite";
import { useSession } from "next-auth/react";
import { Fragment, ReactNode, useEffect } from "react";
import useFetch from "@/hooks/useFetch";
import { useRouter } from "next/navigation";
interface DataProvidersProps {
  children: ReactNode;
}

export default function DataProvider({ children }: DataProvidersProps) {
  const store = useStore();
  const session = useSession();
  const {
    user: { setUser },
    mainLoader,
    setMainLoader,
  } = store;
  const { fetchMembers, fetchStock } = useFetch();

  const fetchAllDAta = async () => {
    try {
      const p = await fetchMembers();
      const m = await fetchStock();

      return { p, m };
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setMainLoader(false);
    }
  };
  const router = useRouter();
  useEffect(() => {
    if (session.data) {
      sessionStorage.setItem(
        "accessToken",
        session.data.backendTokens.accessToken
      );

      setUser({
        _id: session.data.user._id,
        name: session.data.user.name,
        image: session.data.user.image,
        email: session.data.user.email,
        tenantName: session.data.user.tenantName,
      });

      if (!session.data.user.tenantName) {
        return router.push("/waiting");
      }

      if (sessionStorage.getItem("accessToken")) {
        setAuthInterceptor(sessionStorage.getItem("accessToken"));
        fetchAllDAta();
      }
    }
  }, [session.data]);

  // return <Fragment>{mainLoader ? <LayoutLoader /> : children}</Fragment>;
  return <Fragment>{children}</Fragment>;
}
