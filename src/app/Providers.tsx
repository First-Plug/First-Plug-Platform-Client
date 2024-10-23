"use client";

import { setAuthInterceptor } from "@/config/axios.config";
import { RootStore, RootStoreContext } from "@/models";
import { SessionProvider, getSession } from "next-auth/react";
import { ReactNode, useEffect } from "react";

type ProvidersProps = {
  children: ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  const store = RootStore.create({
    orders: {},
    shipments: {},
    products: {},
    teams: {},
    members: {},
    aside: {},
    user: {},
    alerts: {},
  });
  useEffect(() => {
    const setupAxiosInterceptor = async () => {
      const session = await getSession();
      const accessToken = session?.backendTokens.accessToken;
      if (accessToken) {
        setAuthInterceptor(accessToken);
      }
    };

    setupAxiosInterceptor();
  }, []);
  return (
    <RootStoreContext.Provider value={store}>
      <SessionProvider>{children}</SessionProvider>
    </RootStoreContext.Provider>
  );
}
