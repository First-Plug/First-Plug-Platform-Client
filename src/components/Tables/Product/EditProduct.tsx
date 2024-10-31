"use client";

import { Button, PenIcon } from "@/common";
import { useStore } from "@/models";
import { Product } from "@/types";
import { observer } from "mobx-react-lite";
import { useFetchAssetById, usePrefetchAsset } from "@/assets/hooks";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export default observer(function EditProduct({
  product,
}: {
  product: Product;
}) {
  const {
    aside: { setAside },
    products: { setProductToEdit },
  } = useStore();

  const { prefetchAsset } = usePrefetchAsset();
  const { data: prefetchedProduct } = useFetchAssetById(product._id);
  const queryClient = useQueryClient();

  useEffect(() => {
    prefetchAsset(product._id);
  }, [product._id, prefetchAsset]);

  const handleEditProduct = async () => {
    let cachedProduct = queryClient.getQueryData<Product>([
      "assets",
      product._id,
    ]);

    if (cachedProduct) {
      queryClient.setQueryData(["selectedProduct"], cachedProduct);
      setAside("EditProduct");
    } else {
      await prefetchAsset(product._id);

      cachedProduct = queryClient.getQueryData<Product>([
        "assets",
        product._id,
      ]);
      if (cachedProduct) {
        queryClient.setQueryData(["selectedProduct"], cachedProduct);
        setAside("EditProduct");
      } else {
        console.log("Producto aún no cargado completamente tras prefetch");
      }
    }
  };

  return (
    <Button
      variant="text"
      onClick={handleEditProduct}
      onMouseEnter={() => prefetchAsset(product._id)}
    >
      <PenIcon className="text-dark-grey w-4" strokeWidth={2} />
    </Button>
  );
});
