"use client";

import * as React from "react";
import { Label } from "@/shared/components/ui/label";
import { Laptop } from "lucide-react";
import { useGetTableAssets, Product, ProductTable } from "@/features/assets";

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

    return { displayName };
  };

  // Obtener información de asignación
  const getAssignmentInfo = (product: Product) => {
    if (product.assignedMember || product.assignedEmail) {
      return product.assignedMember || product.assignedEmail || "";
    }
    if (product.location === "Our office") {
      return product.office?.officeName || product.officeName || "Our office";
    }
    return null;
  };

  // Función para determinar el OS de un dispositivo
  const getDeviceOS = (asset: Product): "Mac" | "Windows" | "Ubuntu" => {
    const brand =
      asset.attributes?.find(
        (attr) => String(attr.key).toLowerCase() === "brand"
      )?.value?.toLowerCase() || "";
    const model =
      asset.attributes?.find(
        (attr) => String(attr.key).toLowerCase() === "model"
      )?.value?.toLowerCase() || "";
    const name = (asset.name || "").toLowerCase();

    // Detectar Mac
    if (
      brand.includes("apple") ||
      brand.includes("mac") ||
      model.includes("macbook") ||
      model.includes("imac") ||
      name.includes("mac")
    ) {
      return "Mac";
    }

    // Detectar Ubuntu/Linux
    if (
      brand.includes("ubuntu") ||
      model.includes("ubuntu") ||
      name.includes("ubuntu") ||
      name.includes("linux")
    ) {
      return "Ubuntu";
    }

    // Por defecto, Windows
    return "Windows";
  };

  // Contar dispositivos por tipo (Mac/Windows/Ubuntu)
  const deviceCounts = React.useMemo(() => {
    if (selectedAssets.length === 0)
      return { mac: 0, windows: 0, ubuntu: 0 };
    let mac = 0;
    let windows = 0;
    let ubuntu = 0;
    selectedAssets.forEach((asset) => {
      const os = getDeviceOS(asset);
      if (os === "Mac") mac++;
      else if (os === "Ubuntu") ubuntu++;
      else windows++;
    });
    return { mac, windows, ubuntu };
  }, [selectedAssets]);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Device Summary */}
      {selectedAssets.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-4">
            <Laptop className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-lg">
              {selectedAssets.length} device{selectedAssets.length !== 1 ? "s" : ""} to enroll
            </h3>
          </div>
          <div className="flex gap-4 mb-4">
            {deviceCounts.mac > 0 && (
              <div className="flex flex-col items-center justify-center bg-white p-4 border border-gray-200 rounded-lg min-w-[100px]">
                <span className="text-3xl font-bold">{deviceCounts.mac}</span>
                <span className="text-sm text-gray-700">Mac</span>
              </div>
            )}
            {deviceCounts.windows > 0 && (
              <div className="flex flex-col items-center justify-center bg-white p-4 border border-gray-200 rounded-lg min-w-[100px]">
                <span className="text-3xl font-bold">{deviceCounts.windows}</span>
                <span className="text-sm text-gray-700">Windows</span>
              </div>
            )}
            {deviceCounts.ubuntu > 0 && (
              <div className="flex flex-col items-center justify-center bg-white p-4 border border-gray-200 rounded-lg min-w-[100px]">
                <span className="text-3xl font-bold">{deviceCounts.ubuntu}</span>
                <span className="text-sm text-gray-700">Ubuntu</span>
              </div>
            )}
          </div>

          {/* Selected Devices List */}
          <div className="mb-4">
            <div className="font-medium text-sm mb-2">Selected devices:</div>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              {selectedAssets.map((asset) => {
                const displayInfo = getAssetDisplayInfo(asset);
                const assignment = getAssignmentInfo(asset);
                return (
                  <li key={asset._id}>
                    {displayInfo.displayName}
                    {assignment && ` - ${assignment}`}
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
