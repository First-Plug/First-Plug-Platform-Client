import { useMemo } from "react";
import { type UseBoundStore } from "zustand";
import { type Product } from "@/features/assets";

export function useProductsFiltering(
  products: Product[],
  useFilterStore: UseBoundStore<any>
) {
  const filters = useFilterStore((s: any) => s.filters);

  const filteredProducts = useMemo(() => {
    let availableProducts = products.filter(
      (product) => product.status !== "Deprecated"
    );

    if (Object.keys(filters as Record<string, string[]>).length === 0) {
      return availableProducts;
    }

    const filtered = availableProducts.filter((product) => {
      return Object.entries(filters as Record<string, string[]>).every(
        ([column, filterValues]) => {
          if (filterValues.length === 0) return true;

          switch (column) {
            case "serialNumber":
              const serialNumber = product.serialNumber || "No Data";
              return filterValues.includes(serialNumber);

            case "acquisitionDate":
              const date = product.acquisitionDate
                ? new Date(product.acquisitionDate).toLocaleDateString(
                    "es-AR",
                    {
                      timeZone: "UTC",
                    }
                  )
                : "No Data";
              return filterValues.includes(date);

            case "assignedMember":
              const assignedMember = product.assignedMember || "No Data";
              return filterValues.includes(assignedMember);

            case "status + productCondition":
              const status = product.status || "No Data";
              const productCondition = product.productCondition || "Optimal";
              const combinedValue = `${status} - ${productCondition}`;
              return filterValues.includes(combinedValue);

            case "location":
              const location = product.location || "No Data";
              return filterValues.includes(location);

            default:
              return true;
          }
        }
      );
    });

    return filtered;
  }, [products, filters]);

  return {
    filteredProducts,
    filters,
  };
}
