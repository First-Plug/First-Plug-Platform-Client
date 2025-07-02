"use client";
import { useEffect } from "react";

import { PageLayout, BarLoader } from "@/shared";
import { useGetTableAssets, DataStock, EmptyStock } from "@/features/assets";

export default function MyStock() {
  const { data: assets = [], isLoading, isFetching } = useGetTableAssets();

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
