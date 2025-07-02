"use client";
import { Loader } from "@/shared";
import { ProductForm } from "@/features/assets";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Product } from "@/features/assets";

export const EditProductAside = () => {
  const queryClient = useQueryClient();
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  useEffect(() => {
    const cachedProduct = queryClient.getQueryData<Product>([
      "selectedProduct",
    ]);
    if (cachedProduct) {
      setProductToEdit(cachedProduct);
    } else {
      console.error("Producto no encontrado en caché, mostrando loader.");
    }
  }, [queryClient]);

  if (!productToEdit) return <Loader />;

  return (
    <div>
      <ProductForm initialData={productToEdit} isUpdate={true} />
    </div>
  );
};
