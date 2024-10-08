"use client";

import { setAuthInterceptor } from "@/config/axios.config";
import { RootStore, RootStoreContext } from "@/models";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SessionProvider, getSession } from "next-auth/react";
import React, { ReactNode, useEffect } from "react";

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
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: 1000 * 60 * 30, // 30 minutos una vez que los componentes se desmontan se guarda el cache por 30 minutos
      },
    },
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
      <SessionProvider>
        <QueryClientProvider client={queryClient}>
          {children}
          <ReactQueryDevtools initialIsOpen />
        </QueryClientProvider>
      </SessionProvider>
    </RootStoreContext.Provider>
  );
}
