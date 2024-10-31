"use client";

import { setAuthInterceptor } from "@/config/axios.config";
import { RootStore, RootStoreContext } from "@/models";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  PersistQueryClientProvider,
  persistQueryClientRestore,
} from "@tanstack/react-query-persist-client";
import { SessionProvider, getSession, useSession } from "next-auth/react";
import React, { ReactNode, useEffect, useMemo, useState } from "react";

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
  const queryClient = useMemo(() => {
    return new QueryClient({
      defaultOptions: {
        queries: {
          gcTime: 1000 * 60 * 30,
        },
      },
    });
  }, []);

  const [persister, setPersister] = useState<any>(null);
  const [buster, setBuster] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const localPersister = createSyncStoragePersister({
        storage: window.localStorage,
      });
      setPersister(localPersister);
    }
    const setupAxiosInterceptor = async () => {
      const session = await getSession();
      const accessToken = session?.backendTokens.accessToken;
      if (accessToken) {
        setAuthInterceptor(accessToken);
      }
    };

    setupAxiosInterceptor();
  }, []);

  useEffect(() => {
    const persistedData = window.localStorage.getItem(
      "REACT_QUERY_OFFLINE_CACHE"
    );
    // console.log("Persisted data:", persistedData);
  }, []);

  useEffect(() => {
    const restoreData = async () => {
      if (!persister) return;
      try {
        await persistQueryClientRestore({
          queryClient,
          persister,
          maxAge: 1000 * 60 * 60 * 24,
          buster,
        });

        // window.localStorage.getItem("REACT_QUERY_OFFLINE_CACHE");
      } catch (error) {
        console.error("Error restaurando los datos persistidos:", error);
      }
    };
    restoreData();
  }, [persister, queryClient]);

  if (!persister) {
    return null;
  }

  return (
    <RootStoreContext.Provider value={store}>
      <SessionProvider>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{
            persister,
            buster,
            dehydrateOptions: {
              shouldDehydrateQuery: () => true,
            },
          }}
        >
          {children}
          <ReactQueryDevtools initialIsOpen />
        </PersistQueryClientProvider>
      </SessionProvider>
    </RootStoreContext.Provider>
  );
}
