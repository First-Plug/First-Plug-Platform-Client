"use client";

import * as React from "react";
import { Label } from "@/shared/components/ui/label";
import { useGetTableAssets, Product, ProductTable } from "@/features/assets";
import { CountryFlag } from "@/shared";
import { countriesByCode } from "@/shared/constants/country-codes";

interface StepAdditionalDetailsProps {
  assetIds?: string[];
  additionalDetails?: string;
  onDataChange: (updates: { additionalDetails?: string }) => void;
}

export const StepAdditionalDetails: React.FC<StepAdditionalDetailsProps> = ({
  assetIds = [],
  additionalDetails,
  onDataChange,
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

  // Obtener información de display del asset
  // Formato estandarizado: Brand Model (Name)
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

    return { displayName };
  };

  // Obtener información de asignación estandarizada
  const getAssignmentInfo = (product: Product) => {
    const country =
      product.office?.officeCountryCode ||
      product.country ||
      product.countryCode ||
      "";

    if (product.assignedMember || product.assignedEmail) {
      return {
        country,
        assignedTo: product.assignedMember || product.assignedEmail || "",
      };
    }
    if (product.location === "Our office") {
      const officeName =
        product.office?.officeName || product.officeName || "Our office";
      return {
        country,
        assignedTo: `Office ${officeName}`,
      };
    }
    if (product.location === "FP warehouse") {
      return {
        country,
        assignedTo: "FP Warehouse",
      };
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Device Summary */}
      {selectedAssets.length > 0 && (
        <div className="mb-4">
          <div className="mb-4">
            <h3 className="font-semibold text-lg">
              {selectedAssets.length} device{selectedAssets.length !== 1 ? "s" : ""} to enroll
            </h3>
          </div>

          {/* Selected Devices List */}
          <div className="mb-4">
            <div className="font-medium text-sm mb-2">Selected devices:</div>
            <ul className="flex flex-col gap-2 text-sm text-gray-700">
              {selectedAssets.map((asset) => {
                const displayInfo = getAssetDisplayInfo(asset);
                const assignment = getAssignmentInfo(asset);
                return (
                  <li
                    key={asset._id}
                    className="flex flex-col gap-0.5 bg-gray-50 p-2 rounded-md border border-gray-200"
                  >
                    <span className="font-semibold text-gray-900 text-sm">
                      {displayInfo.displayName}
                    </span>
                    {asset.serialNumber && (
                      <span className="text-gray-600 text-xs">
                        <span className="font-medium">SN:</span>{" "}
                        {asset.serialNumber}
                      </span>
                    )}
                    {assignment && (
                      <div className="flex items-center gap-1 text-gray-600 text-xs">
                        <span className="font-medium">Location:</span>
                        {assignment.country && (
                          <CountryFlag
                            countryName={assignment.country}
                            size={14}
                          />
                        )}
                        <span>
                          {assignment.country
                            ? countriesByCode[assignment.country] ||
                              assignment.country
                            : ""}
                        </span>
                        <span>
                          {assignment.assignedTo
                            ? `Assigned to ${assignment.assignedTo}`
                            : ""}
                        </span>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

      {/* Additional Details */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="additional-details">Additional details (optional)</Label>
        <textarea
          id="additional-details"
          placeholder="Describe any specific enrollment requirements, timeline preferences, or additional context..."
          value={additionalDetails || ""}
          onChange={(e) => onDataChange({ additionalDetails: e.target.value })}
          rows={6}
          className="flex bg-background disabled:opacity-50 px-3 py-2 border border-input rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ring-offset-background focus-visible:ring-offset-2 w-full min-h-[120px] placeholder:text-muted-foreground text-sm disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );
};
