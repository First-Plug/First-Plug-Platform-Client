"use client";

import * as React from "react";
import { ChevronDown, ChevronUp, Package } from "lucide-react";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { useGetTableAssets, Product, ProductTable, CategoryIcons } from "@/features/assets";
import {
  cn,
  CountryFlag,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared";
import { countriesByCode } from "@/shared/constants/country-codes";
import type { StorageDetail } from "../../types/quote.types";

interface StepStorageDetailsProps {
  assetIds: string[];
  storageDetails: Record<string, StorageDetail>;
  onDataChange: (updates: {
    storageDetails?: Record<string, StorageDetail>;
  }) => void;
}

/** Título: Brand + Model + Name (si existe) */
const getStorageAssetTitle = (product: Product) => {
  const brand =
    product.attributes?.find(
      (attr) => String(attr.key).toLowerCase() === "brand"
    )?.value || "";
  const model =
    product.attributes?.find(
      (attr) => String(attr.key).toLowerCase() === "model"
    )?.value || "";
  const name = (product.name || "").trim();
  const hasName = name.length > 0;
  const base = [brand, model].filter(Boolean).join(" ").trim();

  if (base) return hasName ? `${base} ${name}`.trim() : base;
  if (hasName) return name;
  return product.category || "Asset";
};

/** Código de país del asset (employee, office o warehouse) */
const getCountryCode = (product: Product): string => {
  if (product.assignedMember || product.assignedEmail) {
    return (
      product.country ||
      product.countryCode ||
      (product as any).office?.officeCountryCode ||
      ""
    );
  }
  if (product.location === "Our office") {
    return (
      (product as any).office?.officeCountryCode ||
      product.country ||
      product.countryCode ||
      ""
    );
  }
  if (product.location === "FP warehouse") {
    return (
      (product as any).fpWarehouse?.warehouseCountryCode ||
      product.country ||
      product.countryCode ||
      ""
    );
  }
  return product.country || product.countryCode || "";
};

/** Debajo del título: "Location: " + employee, Office X, o FP Warehouse (estandarizado) */
const getLocationLabel = (product: Product): string => {
  if (product.assignedMember || product.assignedEmail) {
    return String(
      product.assignedMember || product.assignedEmail || "Unassigned"
    );
  }
  if (product.location === "Our office") {
    const officeName =
      product.office?.officeName || product.officeName || "Our office";
    return `Office ${officeName}`;
  }
  if (product.location === "FP warehouse") {
    return "FP Warehouse";
  }
  if (product.location) {
    return String(product.location);
  }
  return "";
};

export const StepStorageDetails: React.FC<StepStorageDetailsProps> = ({
  assetIds,
  storageDetails,
  onDataChange,
}) => {
  const { data: assetsData } = useGetTableAssets();

  const selectedAssets = React.useMemo(() => {
    if (!assetIds?.length || !assetsData) return [];

    const productsMap = new Map<string, Product>();
    for (const categoryGroup of assetsData as ProductTable[]) {
      if (categoryGroup.products) {
        categoryGroup.products.forEach((product) => {
          productsMap.set(product._id, product);
        });
      }
    }

    const assets: Product[] = [];
    assetIds.forEach((assetId) => {
      const asset = productsMap.get(assetId);
      if (asset) assets.push(asset);
    });
    return assets;
  }, [assetIds, assetsData]);

  const [expandedAssets, setExpandedAssets] = React.useState<Set<string>>(
    selectedAssets.length > 0 ? new Set([selectedAssets[0]._id]) : new Set()
  );

  React.useEffect(() => {
    if (selectedAssets.length > 0) {
      setExpandedAssets((prev) => {
        const next = new Set(prev);
        if (!next.has(selectedAssets[0]._id)) {
          next.add(selectedAssets[0]._id);
        }
        return next;
      });
    } else {
      setExpandedAssets(new Set());
    }
  }, [selectedAssets]);

  const updateStorageDetail = (
    assetId: string,
    field: keyof StorageDetail,
    value: string | undefined
  ) => {
    const currentDetail = storageDetails[assetId] || { assetId };
    const updatedDetails = {
      ...storageDetails,
      [assetId]: {
        ...currentDetail,
        [field]: value,
      },
    };
    onDataChange({ storageDetails: updatedDetails });
  };

  const toggleExpanded = (assetId: string) => {
    setExpandedAssets((prev) => {
      const next = new Set(prev);
      if (next.has(assetId)) {
        next.delete(assetId);
      } else {
        next.add(assetId);
      }
      return next;
    });
  };

  if (selectedAssets.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <p className="text-muted-foreground">No assets selected.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Storage Request header */}
      <div className="flex gap-3 bg-gray-50 p-4 border border-gray-200 rounded-lg">
        <div className="flex flex-shrink-0 justify-center items-center bg-blue/10 border border-blue/20 rounded-full w-12 h-12">
          <Package className="w-6 h-6 text-blue" strokeWidth={2} />
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-sm">Storage Request</p>
          <p className="text-muted-foreground text-sm">
            Configure storage details for {selectedAssets.length} asset
            {selectedAssets.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Storage Details per Asset */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <Label className="font-medium text-sm">
            Storage Details per Asset
          </Label>
          <span className="text-muted-foreground text-xs">
            All fields can be left blank
          </span>
        </div>

        <div className="flex flex-col gap-4 pr-2">
          {selectedAssets.map((asset) => {
            const title = getStorageAssetTitle(asset);
            const countryCode = getCountryCode(asset);
            const countryName = countryCode
              ? countriesByCode[countryCode] || countryCode
              : "";
            const locationLabel = getLocationLabel(asset);
            const detail = storageDetails[asset._id] || { assetId: asset._id };
            const isExpanded = expandedAssets.has(asset._id);

            return (
              <div
                key={asset._id}
                className={cn(
                  "bg-white p-4 border-2 rounded-lg transition-all",
                  isExpanded
                    ? "border-blue shadow-sm"
                    : "border-gray-200 hover:border-blue/50 cursor-pointer"
                )}
              >
                <button
                  type="button"
                  onClick={() => toggleExpanded(asset._id)}
                  className="flex justify-between items-center w-full text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-shrink-0 mt-0.5">
                      <CategoryIcons products={[asset]} />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-base">{title}</span>
                      {asset.serialNumber && (
                        <div className="text-gray-600 text-xs">
                          <span className="font-medium">SN:</span>{" "}
                          {asset.serialNumber}
                        </div>
                      )}
                      <div className="flex flex-wrap items-center gap-x-1 gap-y-1 text-gray-600 text-sm">
                        <span>Location: </span>
                        {countryCode ? (
                          <TooltipProvider>
                            <Tooltip delayDuration={300}>
                              <TooltipTrigger asChild>
                                <span className="inline-flex">
                                  <CountryFlag
                                    countryName={countryCode}
                                    size={18}
                                  />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent className="bg-blue/80 text-white text-xs">
                                {countryName}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : null}
                        {locationLabel ? (
                          <span className="truncate">{locationLabel}</span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp
                      size={20}
                      className="text-blue transition-all duration-200"
                    />
                  ) : (
                    <ChevronDown
                      size={20}
                      className="text-gray-500 transition-all duration-200"
                    />
                  )}
                </button>

                {isExpanded && (
                  <div className="space-y-4 mt-4 pt-4 border-gray-200 border-t">
                    <div className="flex items-end gap-4">
                      <div className="flex flex-col flex-1 gap-2">
                        <Label htmlFor={`approximateSize-${asset._id}`}>
                          Approximate Size
                        </Label>
                        <Input
                          id={`approximateSize-${asset._id}`}
                          placeholder="e.g., 50x30x20 cm, small box..."
                          value={detail.approximateSize || ""}
                          onChange={(e) =>
                            updateStorageDetail(
                              asset._id,
                              "approximateSize",
                              e.target.value || undefined
                            )
                          }
                          className="w-full"
                        />
                      </div>
                      <div className="flex flex-col flex-1 gap-2">
                        <Label htmlFor={`approximateWeight-${asset._id}`}>
                          Approximate Weight
                        </Label>
                        <Input
                          id={`approximateWeight-${asset._id}`}
                          placeholder="e.g., 5 kg, 10 lbs..."
                          value={detail.approximateWeight || ""}
                          onChange={(e) =>
                            updateStorageDetail(
                              asset._id,
                              "approximateWeight",
                              e.target.value || undefined
                            )
                          }
                          className="w-full"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor={`approximateStorageDays-${asset._id}`}>
                        Estimated Storage Duration
                      </Label>
                      <Input
                        id={`approximateStorageDays-${asset._id}`}
                        type="text"
                        placeholder="e.g., 30 days, 3 months, indefinite..."
                        value={detail.approximateStorageDays ?? ""}
                        onChange={(e) =>
                          updateStorageDetail(
                            asset._id,
                            "approximateStorageDays",
                            e.target.value || undefined
                          )
                        }
                        className="w-full"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor={`additionalComments-${asset._id}`}>
                        Additional details
                      </Label>
                      <textarea
                        id={`additionalComments-${asset._id}`}
                        placeholder="Special handling, fragile items, specific requirements..."
                        value={detail.additionalComments || ""}
                        onChange={(e) =>
                          updateStorageDetail(
                            asset._id,
                            "additionalComments",
                            e.target.value || undefined
                          )
                        }
                        rows={3}
                        className="flex bg-background disabled:opacity-50 px-3 py-2 border border-input rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ring-offset-background focus-visible:ring-offset-2 w-full min-h-[80px] placeholder:text-muted-foreground text-sm disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
