"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  SearchInput,
  Badge,
  CountryFlag,
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared";
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
  serviceType?: string; // Tipo de servicio (ej: "buyback", "enrollment", "it-support")
  allowedCategories?: string[]; // Categorías permitidas (ej: ["Computer", "Other"])
  /** Si true, excluir assets que están en FP warehouse (location === "FP warehouse") */
  excludeFromWarehouse?: boolean;
}

export const StepSelectAsset: React.FC<StepSelectAssetProps> = ({
  selectedAssetIds,
  onAssetSelect,
  allowMultiple = false,
  allowedCategory,
  serviceType,
  allowedCategories,
  excludeFromWarehouse = false,
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
        let filteredProducts = categoryGroup.products;
        // Filtrar por categoría única si existe
        if (allowedCategory) {
          filteredProducts = filteredProducts.filter(
            (p) => p.category === allowedCategory
          );
        }
        // Filtrar por múltiples categorías si existe
        else if (allowedCategories && allowedCategories.length > 0) {
          filteredProducts = filteredProducts.filter((p) =>
            allowedCategories.includes(p.category)
          );
        }
        // Excluir assets que están en FP warehouse (solo mostrar los que NO están en warehouse)
        if (excludeFromWarehouse) {
          filteredProducts = filteredProducts.filter(
            (p) => p.location !== "FP warehouse"
          );
        }
        products.push(...filteredProducts);
      }
    });
    return products;
  }, [assetsData, allowedCategory, allowedCategories, excludeFromWarehouse]);

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
  // Formato estandarizado: Brand Model (Name)
  const getProductDisplayInfo = (product: Product) => {
    const brand =
      product.attributes?.find((attr) => attr.key === "brand")?.value || "";
    const model =
      product.attributes?.find((attr) => attr.key === "model")?.value || "";

    let displayName = "";
    if (product.category === "Merchandising") {
      displayName = product.name || "No name";
    } else {
      const parts: string[] = [];
      if (brand) parts.push(brand);
      if (model && model !== "Other") parts.push(model);
      else if (model === "Other") parts.push("Other");

    if (parts.length > 0) {
      displayName = product.name
        ? `${parts.join(" ")} ${product.name}`.trim()
        : parts.join(" ");
      } else {
        displayName = product.name || "No name";
      }
    }

    return { displayName };
  };

  // Obtener información de asignación
  // Formato estandarizado: Location: Bandera País Assigned to (nombre empleado o office y name o FP Warehouse)
  const getAssignmentInfo = (product: Product) => {
    const country =
      product.office?.officeCountryCode ||
      product.country ||
      product.countryCode ||
      "";

    // Si está asignado a un empleado
    if (product.assignedMember || product.assignedEmail) {
      const member =
        product.assignedMember || product.assignedEmail || "Unassigned";

      return {
        type: "employee" as const,
        country,
        assignedTo: member,
      };
    }

    // Si está en una oficina
    if (product.location === "Our office") {
      const officeName =
        product.office?.officeName || product.officeName || "Our office";

      return {
        type: "office" as const,
        country,
        assignedTo: `Office ${officeName}`,
      };
    }

    // Si está en FP warehouse
    if (product.location === "FP warehouse") {
      return {
        type: "warehouse" as const,
        country,
        assignedTo: "FP Warehouse",
      };
    }

    // Si tiene location pero no coincide con los casos anteriores
    if (product.location) {
      return {
        type: "other" as const,
        country,
        assignedTo: product.location,
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
          placeholder="Search by name, brand, model, or serial number"
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
      <div className="flex flex-col gap-3 pr-2 max-h-[340px] overflow-y-auto">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col justify-center items-center gap-4 py-8">
            <p className="text-muted-foreground">
              {searchQuery
                ? "No assets found matching your search."
                : serviceType === "buyback"
                ? "You don't have any assets available for buyback yet."
                : serviceType === "cleaning"
                ? "You don't have any assets available for cleaning yet."
                : serviceType === "destruction-recycling"
                ? "You don't have any assets available for destruction yet."
                : "No assets available."}
            </p>
            {!searchQuery && allProducts.length === 0 && (
              <Button
                variant="primary"
                size="small"
                icon={<Plus size={18} color="white" strokeWidth={2} />}
                onClick={() => router.push("/home/my-stock/add")}
                body="Create asset"
              />
            )}
          </div>
        ) : (
          filteredProducts.map((product) => {
            const { displayName } = getProductDisplayInfo(product);
            const assignment = getAssignmentInfo(product);
            const isSelected = selectedAssetIds.includes(product._id);
            // Verificar si el asset tiene countryCode null o undefined
            const hasMissingCountryCode = !product.countryCode;

            const handleCardClick = () => {
              // Si el asset no tiene countryCode, no permitir seleccionarlo
              // Pero sí permitir deseleccionarlo si ya está seleccionado
              if (hasMissingCountryCode && !isSelected) {
                return;
              }

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
              <div
                key={product._id}
                className={cn(
                  "flex flex-col gap-2 p-4 border-2 rounded-lg transition-all",
                  hasMissingCountryCode
                    ? "border-red-500 bg-red-50/50"
                    : isSelected
                    ? "border-blue bg-blue/5"
                    : "border-gray-200"
                )}
              >
                <button
                  type="button"
                  onClick={handleCardClick}
                  disabled={hasMissingCountryCode && !isSelected}
                  className={cn(
                    "flex items-start gap-4 w-full text-left transition-all",
                    hasMissingCountryCode &&
                      !isSelected &&
                      "cursor-not-allowed opacity-75"
                  )}
                >
                  {/* Icon or Check - Dinámico según selección */}
                  <div className="flex-shrink-0 mt-0.5">
                    {isSelected ? (
                      <div className="flex justify-center items-center bg-blue rounded-full w-8 h-8">
                        <Check className="w-6 h-6 text-white" strokeWidth={3} />
                      </div>
                    ) : (
                      getCategoryIcon(product)
                    )}
                  </div>

                  {/* Main Content - Standardized format */}
                  <div className="flex flex-col flex-1 gap-1">
                    {/* Line 1: Brand Model (Name) */}
                    <span className="font-bold text-sm">{displayName}</span>

                    {/* Line 2: SN: serial number */}
                    {product.serialNumber && (
                      <div className="text-gray-600 text-xs">
                        <span className="font-medium">SN:</span>{" "}
                        {product.serialNumber}
                      </div>
                    )}

                    {/* Line 3: Location: Flag (tooltip país) + office/member/FP Warehouse */}
                    {assignment && (
                      <div className="flex items-center gap-1 text-gray-600 text-xs">
                        <span className="font-medium">Location:</span>
                        {assignment.country && (
                          <TooltipProvider>
                            <Tooltip delayDuration={300}>
                              <TooltipTrigger asChild>
                                <span className="inline-flex">
                                  <CountryFlag
                                    countryName={assignment.country}
                                    size={18}
                                  />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent className="bg-blue/80 text-white text-xs">
                                {countriesByCode[assignment.country] ||
                                  assignment.country}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        {assignment.country && assignment.assignedTo && (
                          <span className="text-muted-foreground"> - </span>
                        )}
                        {assignment.assignedTo && (
                          <span>{assignment.assignedTo}</span>
                        )}
                      </div>
                    )}
                  </div>
                </button>

                {/* Mensaje informativo si falta countryCode */}
                {hasMissingCountryCode && (
                  <div className="flex justify-start items-center pt-2 border-red-200 border-t">
                    <p className="text-red-600 text-sm">
                      This product can&apos;t be selected because it&apos;s
                      assigned to an unknown member.
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
