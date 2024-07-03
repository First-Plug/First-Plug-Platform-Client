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

export default observer(function MyStock() {
  const [loading, setLoading] = useState(true);
  const {
    products: { tableProducts, fetchingStock },
  } = useStore();
  const { fetchStock } = useFetch();
  useEffect(() => {
    if (sessionStorage.getItem("accessToken")) {
      setAuthInterceptor(sessionStorage.getItem("accessToken"));
      if (!tableProducts.length) {
        fetchStock();
      }
    }
    setLoading(false);
  }, []);

  return (
    <PageLayout>
      {!fetchingStock && tableProducts?.length ? <DataStock /> : null}
      {!fetchingStock && !tableProducts.length && !loading && <EmptyStock />}
      {fetchingStock && <BarLoader />}
    </PageLayout>
  );
});
