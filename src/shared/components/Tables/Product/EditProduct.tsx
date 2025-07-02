"use client";

import { Button, PenIcon } from "@/shared";

import { Product, ProductTable } from "@/features/assets";

import { useQueryClient } from "@tanstack/react-query";
import { useAsideStore } from "@/shared";

export default function EditProduct({ product }: { product: Product }) {
  const { setAside } = useAsideStore();
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
    <Button variant="outline" onClick={handleEditProduct}>
      <PenIcon className="w-4 text-blue hover:text-blue/70" strokeWidth={2} />
    </Button>
  );
}
