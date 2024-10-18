"use client";

import { setAuthInterceptor } from "@/config/axios.config";
import { RootStore, RootStoreContext } from "@/models";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
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
        gcTime: 1000 * 60 * 30,
      },
    },
  });

  const persister = createSyncStoragePersister({
    storage: window.localStorage,
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
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{ persister, maxAge: 1000 * 60 * 60 * 24 }}
        >
          {children}
          <ReactQueryDevtools initialIsOpen />
        </PersistQueryClientProvider>
      </SessionProvider>
    </RootStoreContext.Provider>
  );
}
