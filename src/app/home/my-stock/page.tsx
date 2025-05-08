"use client";
import { observer } from "mobx-react-lite";
import { useStore } from "@/models";
import DataStock from "./DataStock";
import EmptyStock from "./EmptyStock";
import { PageLayout } from "@/common";
import { BarLoader } from "@/components/Loader/BarLoader";
import useFetch from "@/hooks/useFetch";
import { useEffect, useState } from "react";
import { setAuthInterceptor } from "@/config/axios.config";
import { useGetTableAssets } from "@/assets/hooks";

export default observer(function MyStock() {
  const { data: assets = [], isLoading, isFetching } = useGetTableAssets();

  const [loading, setLoading] = useState(true);

  const {
    products: { setTable },
  } = useStore();

  useEffect(() => {
    if (assets.length) {
      setTable(assets);
    }
  }, [assets, setTable]);

  useEffect(() => {
    if (sessionStorage.getItem("accessToken")) {
      setAuthInterceptor(sessionStorage.getItem("accessToken"));
    }
    setLoading(false);
  }, []);

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
});
