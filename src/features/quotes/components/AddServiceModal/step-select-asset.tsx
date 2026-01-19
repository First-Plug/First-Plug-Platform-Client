"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { SearchInput, Badge, CountryFlag, Button } from "@/shared";
import {
  useGetTableAssets,
  Product,
  ProductTable,
  CategoryIcons,
} from "@/features/assets";
import { cn } from "@/shared";
import { Check, Plus } from "lucide-react";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Label } from "@/shared/components/ui/label";
import { countriesByCode } from "@/shared/constants/country-codes";

interface StepSelectAssetProps {
  selectedAssetIds: string[]; // Array de IDs seleccionados (permite single o multiple)
  onAssetSelect: (assetIds: string[]) => void; // Callback con array de IDs
  allowMultiple?: boolean; // Si es true, permite seleccionar múltiples; si es false, solo uno
  allowedCategory?: string; // Categoría permitida (ej: "Computer")
}

export const StepSelectAsset: React.FC<StepSelectAssetProps> = ({
  selectedAssetIds,
  onAssetSelect,
  allowMultiple = false,
  allowedCategory,
}) => {
  const { data: assetsData, isLoading } = useGetTableAssets();
  const [searchQuery, setSearchQuery] = React.useState("");
  const router = useRouter();

  // Aplanar todos los productos de todas las categorías, filtrando por categoría si es necesario
  const allProducts = React.useMemo(() => {
    if (!assetsData) return [];
    const products: Product[] = [];
    assetsData.forEach((categoryGroup: ProductTable) => {
      if (categoryGroup.products) {
        const filteredProducts = allowedCategory
          ? categoryGroup.products.filter((p) => p.category === allowedCategory)
          : categoryGroup.products;
        products.push(...filteredProducts);
      }
    });
    return products;
  }, [assetsData, allowedCategory]);

  // Filtrar productos según la búsqueda
  const filteredProducts = React.useMemo(() => {
    if (!searchQuery.trim()) return allProducts;

    const query = searchQuery.toLowerCase().trim();
    return allProducts.filter((product) => {
      // Buscar por nombre
      const name = (product.name || "").toLowerCase();
      // Buscar por brand
      const brand =
        product.attributes
          ?.find((attr) => attr.key === "brand")
          ?.value?.toLowerCase() || "";
      // Buscar por model
      const model =
        product.attributes
          ?.find((attr) => attr.key === "model")
          ?.value?.toLowerCase() || "";
      // Buscar por serial number
      const serialNumber = (product.serialNumber || "").toLowerCase();

      return (
        name.includes(query) ||
        brand.includes(query) ||
        model.includes(query) ||
        serialNumber.includes(query)
      );
    });
  }, [allProducts, searchQuery]);

  // Obtener información del producto para mostrar
  const getProductDisplayInfo = (product: Product) => {
    const brand =
      product.attributes?.find((attr) => attr.key === "brand")?.value || "";
    const model =
      product.attributes?.find((attr) => attr.key === "model")?.value || "";
    const storage =
      product.attributes?.find((attr) => attr.key === "storage")?.value || "";

    let displayName = "";
    if (product.category === "Merchandising") {
      displayName = product.name || "No name";
    } else {
      if (brand && model) {
        displayName =
          model === "Other"
            ? `${brand} Other ${product.name || ""}`.trim()
            : `${brand} ${model}`;
      } else {
        displayName = product.name || "No name";
      }
    }

    let specifications = "";
    if (product.category === "Merchandising") {
      const color =
        product.attributes?.find((attr) => attr.key === "color")?.value || "";
      specifications = color
        ? `${product.name}${color ? ` (${color})` : ""}`
        : product.name || "";
    } else {
      const parts: string[] = [];
      if (brand) parts.push(brand);
      if (model) parts.push(model);
      if (storage) parts.push(storage);
      specifications = parts.join(" • ");
    }

    return { displayName, specifications };
  };

  // Obtener información de asignación
  const getAssignmentInfo = (product: Product) => {
    // Si está asignado a un empleado
    if (product.assignedMember || product.assignedEmail) {
      const member =
        product.assignedMember || product.assignedEmail || "Unassigned";
      const location = product.location || product.officeName || "";
      const country = product.country || product.countryCode || "";

      return {
        type: "employee" as const,
        member,
        location: location ? `${location}` : "",
        country,
      };
    }

    // Si está en una oficina
    if (product.location === "Our office") {
      const officeName =
        product.office?.officeName || product.officeName || "Our office";
      const country =
        product.office?.officeCountryCode ||
        product.country ||
        product.countryCode ||
        "";

      return {
        type: "office" as const,
        officeName,
        country,
      };
    }

    // Si está en FP warehouse
    if (product.location === "FP warehouse") {
      const country = product.country || product.countryCode || "";

      return {
        type: "warehouse" as const,
        country,
      };
    }

    // Si tiene location pero no coincide con los casos anteriores
    if (product.location) {
      return {
        type: "other" as const,
        location: product.location,
      };
    }

    return null;
  };

  // Obtener icono de categoría
  const getCategoryIcon = (product: Product) => {
    return <CategoryIcons products={[product]} />;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p className="text-muted-foreground">Loading assets...</p>
      </div>
    );
  }

  const selectedCount = selectedAssetIds.length;
  const maxAllowed = allowMultiple ? filteredProducts.length : 1;

  // Calcular si todos están seleccionados
  const allSelected =
    allowMultiple &&
    filteredProducts.length > 0 &&
    filteredProducts.every((product) => selectedAssetIds.includes(product._id));

  // Manejar select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Seleccionar todos los productos filtrados
      const allIds = filteredProducts.map((product) => product._id);
      onAssetSelect(allIds);
    } else {
      // Deseleccionar todos
      onAssetSelect([]);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Search Input */}
      <div className="w-full">
        <SearchInput
          placeholder="Buscar por nombre, marca, modelo o número de serie..."
          onSearch={setSearchQuery}
        />
      </div>

      <div className="flex justify-between items-center">
        {/* Select All Checkbox - Solo mostrar si allowMultiple es true */}
        {allowMultiple && filteredProducts.length > 0 && (
          <div className="flex items-center gap-2">
            <Checkbox
              id="select-all"
              checked={allSelected}
              onCheckedChange={handleSelectAll}
            />
              <Label
                htmlFor="select-all"
                className="font-medium text-sm cursor-pointer"
              >
                Select all
              </Label>
          </div>
        )}

        {/* Selection Counter - Always visible */}
        <div className="flex justify-end items-center">
          <span className="text-muted-foreground text-sm">
            selected {selectedCount} / {maxAllowed}
          </span>
        </div>
      </div>

      {/* Assets List */}
      <div className="flex flex-col gap-3 pr-2 max-h-[500px] overflow-y-auto">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col justify-center items-center py-8 gap-4">
            <p className="text-muted-foreground">
              {searchQuery
                ? "No assets found matching your search."
                : "No assets available."}
            </p>
            {!searchQuery && allProducts.length === 0 && (
              <Button
                variant="primary"
                size="small"
                icon={<Plus size={18} color="white" strokeWidth={2} />}
                onClick={() => router.push("/home/my-stock/add")}
                body="Create Product"
              />
            )}
          </div>
        ) : (
          filteredProducts.map((product) => {
            const { displayName, specifications } =
              getProductDisplayInfo(product);
            const assignment = getAssignmentInfo(product);
            const isSelected = selectedAssetIds.includes(product._id);

            const handleCardClick = () => {
              if (allowMultiple) {
                // Modo múltiple: toggle del asset
                const newSelection = isSelected
                  ? selectedAssetIds.filter((id) => id !== product._id)
                  : [...selectedAssetIds, product._id];
                onAssetSelect(newSelection);
              } else {
                // Modo single: reemplazar la selección
                const newSelection = isSelected ? [] : [product._id];
                onAssetSelect(newSelection);
              }
            };

            return (
              <button
                key={product._id}
                type="button"
                onClick={handleCardClick}
                className={cn(
                  "flex items-center gap-4 bg-white p-4 border-2 rounded-lg text-left transition-all",
                  isSelected
                    ? "border-blue bg-blue/5"
                    : "border-gray-200 hover:border-blue"
                )}
              >
                {/* Icon or Check - Dinámico según selección */}
                <div className="flex-shrink-0">
                  {isSelected ? (
                    <div className="flex justify-center items-center bg-blue rounded-full w-8 h-8">
                      <Check className="w-6 h-6 text-white" strokeWidth={3} />
                    </div>
                  ) : (
                    getCategoryIcon(product)
                  )}
                </div>

                {/* Main Content */}
                <div className="flex flex-col flex-1 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base">{displayName}</span>
                    <Badge variant="outline" className="text-xs">
                      {product.category}
                    </Badge>
                  </div>

                  <div className="text-gray-700 text-sm">{specifications}</div>

                  {assignment && (
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      {assignment.type === "employee" && (
                        <>
                          <span>Assigned to: {assignment.member}</span>
                          {assignment.location && (
                            <span>• {assignment.location}</span>
                          )}
                          {assignment.country && (
                            <div className="flex items-center gap-1">
                              <CountryFlag
                                countryName={assignment.country}
                                size={15}
                              />
                              <span>
                                {countriesByCode[assignment.country] ||
                                  assignment.country}
                              </span>
                            </div>
                          )}
                        </>
                      )}
                      {assignment.type === "office" && (
                        <>
                          <span>Location: office {assignment.officeName}</span>
                          {assignment.country && (
                            <div className="flex items-center gap-1">
                              <CountryFlag
                                countryName={assignment.country}
                                size={15}
                              />
                              <span>
                                {countriesByCode[assignment.country] ||
                                  assignment.country}
                              </span>
                            </div>
                          )}
                        </>
                      )}
                      {assignment.type === "warehouse" && (
                        <>
                          <span>Location: FP warehouse</span>
                          {assignment.country && (
                            <div className="flex items-center gap-1">
                              <CountryFlag
                                countryName={assignment.country}
                                size={15}
                              />
                              <span>
                                {countriesByCode[assignment.country] ||
                                  assignment.country}
                              </span>
                            </div>
                          )}
                        </>
                      )}
                      {assignment.type === "other" && (
                        <span>Location: {assignment.location}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Serial Number */}
                {product.serialNumber && (
                  <div className="flex-shrink-0 text-gray-600 text-sm">
                    SN: {product.serialNumber}
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
