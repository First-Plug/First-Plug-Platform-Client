"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { observer } from "mobx-react-lite";
import { useStore } from "@/models";
import { setAuthInterceptor } from "@/config/axios.config";
import { AuthServices } from "@/services";

export const AuthProvider = observer(
  ({ children }: { children: React.ReactNode }) => {
    const { data: sessionData } = useSession();
    const {
      user: { setUser },
    } = useStore();

    useEffect(() => {
      if (sessionStorage.getItem("accessToken")) {
        setAuthInterceptor(sessionStorage.getItem("accessToken"));

        if (sessionData?.user?._id) {
          AuthServices.getUserInfro(sessionData.user._id)
            .then((userInfo) => {
              setUser(userInfo);
            })
            .catch((error) => {
              console.error("Error fetching user info:", error);
            });
        }
      }
    }, [sessionData?.user?._id, setUser]);

    return <>{children}</>;
  }
);
