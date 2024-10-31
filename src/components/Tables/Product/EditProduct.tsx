"use client";

import { Button, PenIcon } from "@/common";
import { useStore } from "@/models";
import { Product } from "@/types";
import { observer } from "mobx-react-lite";
import { useFetchAssetById, usePrefetchAsset } from "@/assets/hooks";
import { useEffect } from "react";

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

  useEffect(() => {
    prefetchAsset(product._id);
  }, [product._id, prefetchAsset]);

  const handleEditProduct = () => {
    if (prefetchedProduct) {
      setProductToEdit(prefetchedProduct);
      setAside("EditProduct");
    } else {
      console.log("producto aun no cargado completamente");
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
