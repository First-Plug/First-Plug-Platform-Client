"use client";
import { useEffect } from "react";
import { useStore } from "@/models";

import { PageLayout, BarLoader } from "@/shared";
import { useGetTableAssets, DataStock, EmptyStock } from "@/features/assets";

export default function MyStock() {
  const { data: assets = [], isLoading, isFetching } = useGetTableAssets();

  const {
    products: { setTable },
  } = useStore();

  useEffect(() => {
    if (assets.length) {
      setTable(assets);
    }
  }, [assets, setTable]);

  return (
    <PageLayout>
      {isLoading || isFetching ? (
        <BarLoader />
      ) : assets.length ? (
        <DataStock assets={assets} />
      ) : (
        <EmptyStock />
      )}
    </PageLayout>
  );
}
