"use client";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  PersistQueryClientProvider,
  persistQueryClientRestore,
} from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

interface Props {
  children: ReactNode;
}

export const QueryProvider = ({ children }: Props) => {
  const queryClient = useMemo(() => {
    return new QueryClient({
      defaultOptions: {
        queries: {
          gcTime: 1000 * 60 * 30,
          refetchOnWindowFocus: true,
          refetchOnMount: true,
          refetchOnReconnect: true,
        },
      },
    });
  }, []);

  const [persister, setPersister] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const localPersister = createSyncStoragePersister({
        storage: window.localStorage,
      });
      setPersister(localPersister);
    }

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        console.warn("Long task detected:", entry);
      });
    });

    observer.observe({ entryTypes: ["longtask"] });

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const restoreData = async () => {
      if (!persister) return;
      try {
        await persistQueryClientRestore({
          queryClient,
          persister,
          maxAge: 1000 * 60 * 60 * 24,
        });
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
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        dehydrateOptions: {
          shouldDehydrateQuery: () => true,
        },
      }}
    >
      {children}
      <ReactQueryDevtools initialIsOpen />
    </PersistQueryClientProvider>
  );
};
