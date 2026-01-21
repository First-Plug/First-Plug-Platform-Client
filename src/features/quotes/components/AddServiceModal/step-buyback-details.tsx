"use client";

import * as React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { useGetTableAssets, Product, ProductTable } from "@/features/assets";
import { cn } from "@/shared";

interface BuybackDetail {
  assetId: string;
  generalFunctionality?: string;
  batteryCycles?: string;
  aestheticDetails?: string;
  hasCharger?: boolean;
  chargerWorks?: boolean;
  additionalComments?: string;
}

interface StepBuybackDetailsProps {
  assetIds: string[];
  buybackDetails: Record<string, BuybackDetail>;
  additionalInfo?: string;
  onDataChange: (updates: Record<string, BuybackDetail>) => void;
  onAdditionalInfoChange?: (additionalInfo: string) => void;
}

export const StepBuybackDetails: React.FC<StepBuybackDetailsProps> = ({
  assetIds,
  buybackDetails,
  additionalInfo,
  onDataChange,
  onAdditionalInfoChange,
}) => {
  const { data: assetsData } = useGetTableAssets();

  // Encontrar los assets seleccionados
  const selectedAssets = React.useMemo(() => {
    if (!assetIds || assetIds.length === 0 || !assetsData) return [];

    const assets: Product[] = [];
    for (const categoryGroup of assetsData) {
      if (categoryGroup.products) {
        assetIds.forEach((assetId) => {
          const asset = categoryGroup.products.find((p) => p._id === assetId);
          if (asset) assets.push(asset);
        });
      }
    }
    return assets;
  }, [assetIds, assetsData]);

  // Solo expandir el primer asset por defecto (basado en selectedAssets, no assetIds)
  const [expandedAssets, setExpandedAssets] = React.useState<Set<string>>(
    selectedAssets.length > 0 ? new Set([selectedAssets[0]._id]) : new Set()
  );

  // Actualizar expandedAssets cuando cambien los selectedAssets
  React.useEffect(() => {
    if (selectedAssets.length > 0) {
      // Solo expandir el primer asset
      setExpandedAssets(new Set([selectedAssets[0]._id]));
    } else {
      setExpandedAssets(new Set());
    }
  }, [selectedAssets]);

  // Obtener información de display del asset
  const getAssetDisplayInfo = (product: Product) => {
    const brand =
      product.attributes?.find(
        (attr) => String(attr.key).toLowerCase() === "brand"
      )?.value || "";
    const model =
      product.attributes?.find(
        (attr) => String(attr.key).toLowerCase() === "model"
      )?.value || "";

    let displayName = "";
    if (brand && model) {
      displayName = model === "Other" ? `${brand} Other` : `${brand} ${model}`;
    } else {
      displayName = product.name || "No name";
    }

    let specifications = "";
    const parts: string[] = [];
    if (brand) parts.push(brand);
    if (model) parts.push(model);
    specifications = parts.join(" • ");

    return { displayName, specifications };
  };

  const updateBuybackDetail = (assetId: string, field: keyof BuybackDetail, value: any) => {
    const currentDetail = buybackDetails[assetId] || { assetId };
    const updatedDetails = {
      ...buybackDetails,
      [assetId]: {
        ...currentDetail,
        [field]: value,
      },
    };
    onDataChange(updatedDetails);
  };

  const toggleExpanded = (assetId: string) => {
    const newExpanded = new Set(expandedAssets);
    if (newExpanded.has(assetId)) {
      newExpanded.delete(assetId);
    } else {
      newExpanded.add(assetId);
    }
    setExpandedAssets(newExpanded);
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
      <p className="text-muted-foreground text-center">
        Expand each asset to provide additional details for a more accurate quote
      </p>

      <div className="flex flex-col gap-4 pr-2">
        {selectedAssets.map((asset) => {
          const { displayName, specifications } = getAssetDisplayInfo(asset);
          const detail = buybackDetails[asset._id] || { assetId: asset._id };
          const isExpanded = expandedAssets.has(asset._id);

          return (
            <div
              key={asset._id}
              className={cn(
                "border-2 rounded-lg p-4 bg-white transition-all",
                isExpanded
                  ? "border-blue shadow-sm"
                  : "border-gray-200 hover:border-blue/50 cursor-pointer"
              )}
            >
              {/* Asset Header - Clickable */}
              <button
                type="button"
                onClick={() => toggleExpanded(asset._id)}
                className="flex justify-between items-center w-full text-left"
              >
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-base">{displayName}</span>
                  {specifications && (
                    <span className="text-sm text-gray-600">{specifications}</span>
                  )}
                  {asset.serialNumber && (
                    <span className="text-xs text-gray-500">
                      SN: {asset.serialNumber}
                    </span>
                  )}
                </div>
                {isExpanded ? (
                  <ChevronDown
                    size={20}
                    className="text-blue transition-all duration-200"
                  />
                ) : (
                  <ChevronRight
                    size={20}
                    className="text-gray-500 transition-all duration-200"
                  />
                )}
              </button>

              {/* Form Fields - Show when expanded */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                  {/* Overall Condition */}
                  <div className="flex flex-col gap-2">
                    <Label htmlFor={`general-${asset._id}`}>
                      Overall condition: Describe the general working condition
                    </Label>
                    <textarea
                      id={`general-${asset._id}`}
                      placeholder="Describe the general working condition"
                      value={detail.generalFunctionality || ""}
                      onChange={(e) =>
                        updateBuybackDetail(
                          asset._id,
                          "generalFunctionality",
                          e.target.value
                        )
                      }
                      rows={3}
                      className="flex bg-background disabled:opacity-50 px-3 py-2 border border-input rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ring-offset-background focus-visible:ring-offset-2 w-full min-h-[80px] placeholder:text-muted-foreground text-sm disabled:cursor-not-allowed"
                      required
                    />
                  </div>

                  {/* Battery Cycle Count */}
                  <div className="flex flex-col gap-2">
                    <Label htmlFor={`battery-${asset._id}`}>
                      Battery cycle count: Enter the number of battery cycles (if known)
                    </Label>
                    <Input
                      id={`battery-${asset._id}`}
                      type="text"
                      placeholder="e.g. 450 or 'Unknown'"
                      value={detail.batteryCycles || ""}
                      onChange={(e) =>
                        updateBuybackDetail(
                          asset._id,
                          "batteryCycles",
                          e.target.value || undefined
                        )
                      }
                      className="w-full"
                    />
                  </div>

                  {/* Cosmetic Condition */}
                  <div className="flex flex-col gap-2">
                    <Label htmlFor={`aesthetic-${asset._id}`}>
                      Cosmetic condition: Describe any visible wear or damage
                    </Label>
                    <textarea
                      id={`aesthetic-${asset._id}`}
                      placeholder="Describe any visible wear or damage"
                      value={detail.aestheticDetails || ""}
                      onChange={(e) =>
                        updateBuybackDetail(
                          asset._id,
                          "aestheticDetails",
                          e.target.value
                        )
                      }
                      rows={2}
                      className="flex bg-background disabled:opacity-50 px-3 py-2 border border-input rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ring-offset-background focus-visible:ring-offset-2 w-full min-h-[60px] placeholder:text-muted-foreground text-sm disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* Includes a working charger? */}
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`hasCharger-${asset._id}`}
                      checked={detail.hasCharger || false}
                      onCheckedChange={(checked) =>
                        updateBuybackDetail(
                          asset._id,
                          "hasCharger",
                          checked === true
                        )
                      }
                    />
                    <Label
                      htmlFor={`hasCharger-${asset._id}`}
                      className="font-normal cursor-pointer"
                    >
                      Includes a working charger? Select if a functional charger is included.
                    </Label>
                  </div>

                  {/* Additional Comments */}
                  <div className="flex flex-col gap-2">
                    <Label htmlFor={`comments-${asset._id}`}>
                      Additional comments: Optional notes about the asset
                    </Label>
                    <textarea
                      id={`comments-${asset._id}`}
                      placeholder="Optional notes about the asset"
                      value={detail.additionalComments || ""}
                      onChange={(e) =>
                        updateBuybackDetail(
                          asset._id,
                          "additionalComments",
                          e.target.value
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

      {/* Additional Info (for the whole service) */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="additional-info">Additional info (optional)</Label>
        <textarea
          id="additional-info"
          placeholder="General information about the buyback request..."
          value={additionalInfo || ""}
          onChange={(e) => {
            if (onAdditionalInfoChange) {
              onAdditionalInfoChange(e.target.value);
            }
          }}
          rows={3}
          className="flex bg-background disabled:opacity-50 px-3 py-2 border border-input rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ring-offset-background focus-visible:ring-offset-2 w-full min-h-[80px] placeholder:text-muted-foreground text-sm disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );
};
