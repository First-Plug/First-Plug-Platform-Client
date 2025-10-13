import { useState } from "react";
import { CATEGORIES } from "@/features/assets/interfaces/product";

interface Product {
  status: string;
  deleted?: boolean;
}

interface ProductTable {
  category: string;
  products: Product[];
}

export const useProductStats = (products: ProductTable[]) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(
    CATEGORIES[0]
  );

  // Validación defensiva: asegurar que products sea un array válido
  const safeProducts = Array.isArray(products) ? products : [];

  const categoryProducts = selectedCategory
    ? safeProducts
        .filter(
          (table) =>
            table.category.toLowerCase() === selectedCategory.toLowerCase()
        )
        .flatMap((table) => table.products)
        .filter((product) => !product.deleted)
    : [];

  const stats = {
    available: categoryProducts.filter(
      (product) => product.status === "Available"
    ).length,
    assigned: categoryProducts.filter(
      (product) => product.status === "Delivered"
    ).length,
    unavailable: categoryProducts.filter(
      (product) => product.status === "Unavailable"
    ).length,
    inTransit: categoryProducts.filter(
      (product) => product.status === "In Transit"
    ).length,
    inTransitMissingData: categoryProducts.filter(
      (product) => product.status === "In Transit - Missing Data"
    ).length,
  };

  return {
    selectedCategory,
    setSelectedCategory,
    categoryProducts,
    stats,
  };
};
