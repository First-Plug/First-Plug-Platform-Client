"use client";

import { Button, PenIcon } from "@/common";
import { useStore } from "@/models";
import { Product, ProductTable } from "@/types";
import { observer } from "mobx-react-lite";
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
  const queryClient = useQueryClient();

  const handleEditProduct = () => {
    const cachedAssets = queryClient.getQueryData<ProductTable[]>(["assets"]);

    let cachedProduct: Product | undefined;
    if (cachedAssets) {
      cachedAssets.some((group) => {
        cachedProduct = group.products.find((p) => p._id === product._id);
        return Boolean(cachedProduct);
      });
    }

    if (cachedProduct) {
      queryClient.setQueryData(["selectedProduct"], cachedProduct);
      setAside("EditProduct");
    } else {
      console.error(
        "Producto no encontrado en caché; el aside mostrará un loader."
      );
    }
  };

  return (
    <Button
      variant="text"
      onClick={handleEditProduct}
      // onMouseEnter={() => prefetchAsset(product._id)}
    >
      <PenIcon className="text-dark-grey w-4" strokeWidth={2} />
    </Button>
  );
});
