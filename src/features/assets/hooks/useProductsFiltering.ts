import { useMemo } from "react";
import { type UseBoundStore } from "zustand";
import { type Product } from "@/features/assets";
import { countriesByCode } from "@/shared";

export function useProductsFiltering(
  products: Product[],
  useFilterStore: UseBoundStore<any>,
  tableId?: string
) {
  const getFiltersForTable = useFilterStore((s: any) => s.getFiltersForTable);
  const legacyFilters = useFilterStore((s: any) => s.filters);
  const filters = tableId ? getFiltersForTable(tableId) : legacyFilters;

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
              if (filterValues.includes("empty")) {
                return assignedMember === "";
              }
              return filterValues.includes(assignedMember);

            case "status + productCondition":
              const status = product.status || "No Data";
              const productCondition = product.productCondition || "Optimal";
              const combinedValue = `${status} - ${productCondition}`;
              return filterValues.includes(combinedValue);

            case "location":
              const location = product.location || "No Data";
              const countryName = product.countryCode
                ? countriesByCode[product.countryCode.toUpperCase()]
                : null;
              const locationWithCountry = countryName
                ? `${location} - ${countryName}`
                : location;
              return filterValues.includes(locationWithCountry);

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
