"use client";
import { useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import { getTableAssets } from "@/features/assets";

import { ProductTable } from "@/features/assets";

export const usePrefetchAssets = () => {
  const queryClient = useQueryClient();
  const isPrefetchingRef = useRef(false);

  const prefetchAssets = async () => {
    if (isPrefetchingRef.current) return;
    isPrefetchingRef.current = true;

    try {
      let assets = queryClient.getQueryData<ProductTable[]>(["assets"]);

      if (!assets) {
        assets = await queryClient.fetchQuery<ProductTable[]>({
          queryKey: ["assets"],
          queryFn: getTableAssets,
          staleTime: 1000 * 60 * 5,
        });
      }
    } catch (error) {
      console.error("Error prefetching assets:", error);
    } finally {
      isPrefetchingRef.current = false;
    }
  };

  return { prefetchAssets };
};
