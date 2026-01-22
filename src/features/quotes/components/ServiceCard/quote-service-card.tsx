"use client";

import * as React from "react";
import { Trash2, Wrench, Shield, Laptop, ArrowLeftRight } from "lucide-react";
import {
  Badge,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Button,
  CountryFlag,
} from "@/shared";
import { countriesByCode } from "@/shared/constants/country-codes";
import { useQuoteStore } from "../../store/quote.store";
import type { QuoteService } from "../../types/quote.types";
import { useGetTableAssets, Product, ProductTable } from "@/features/assets";
import { cn } from "@/shared";

const issueTypesMap: Record<string, string> = {
  "software-issue": "Software issue",
  "connectivity-network": "Connectivity / network",
  "account-access": "Account / access issue",
  performance: "Performance issues",
  "damage-accident": "Damage / accident",
  other: "Other",
};

const impactLevelMap: Record<
  string,
  { label: string; colorClass: string; textClass: string }
> = {
  low: { label: "Low", colorClass: "bg-success", textClass: "text-white" },
  medium: {
    label: "Medium",
    colorClass: "bg-lightYellow",
    textClass: "text-black",
  },
  high: { label: "High", colorClass: "bg-error", textClass: "text-white" },
};

interface QuoteServiceCardProps {
  service: QuoteService;
}

export const QuoteServiceCard: React.FC<QuoteServiceCardProps> = ({
  service,
}) => {
  const { removeService } = useQuoteStore();
  const { data: assetsData } = useGetTableAssets();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  const handleDelete = () => {
    removeService(service.id);
    setIsDeleteDialogOpen(false);
  };

  const formatServiceType = (serviceType?: string) => {
    if (!serviceType) return null;
    const serviceTypeMap: Record<string, string> = {
      "it-support": "IT Support",
      "enrollment": "Enrollment",
      "buyback": "Buyback",
    };
    return serviceTypeMap[serviceType] || serviceType;
  };

  // Encontrar el asset seleccionado (para IT Support)
  const selectedAsset = React.useMemo(() => {
    if (!service.assetId || !assetsData) return null;

    for (const categoryGroup of assetsData) {
      if (categoryGroup.products) {
        const asset = categoryGroup.products.find(
          (p) => p._id === service.assetId
        );
        if (asset) return asset;
      }
    }
    return null;
  }, [service.assetId, assetsData]);

  // Encontrar los assets seleccionados (para Enrollment)
  const selectedAssets = React.useMemo(() => {
    if (!service.assetIds || !assetsData || service.assetIds.length === 0)
      return [];

    const assets: Product[] = [];
    for (const categoryGroup of assetsData) {
      if (categoryGroup.products) {
        service.assetIds.forEach((assetId) => {
          const asset = categoryGroup.products.find((p) => p._id === assetId);
          if (asset) assets.push(asset);
        });
      }
    }
    return assets;
  }, [service.assetIds, assetsData]);

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

  // Contar dispositivos por tipo (Mac/Windows/Ubuntu) para Enrollment
  const deviceCounts = React.useMemo(() => {
    if (selectedAssets.length === 0) return { mac: 0, windows: 0, ubuntu: 0 };
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

  // Obtener nombre y especificaciones del asset
  const getAssetDisplayInfo = (product: Product) => {
    const brand = product.attributes?.find(
      (attr) => String(attr.key).toLowerCase() === "brand"
    )?.value;
    const model = product.attributes?.find(
      (attr) => String(attr.key).toLowerCase() === "model"
    )?.value;

    // DisplayName es el brand (o el nombre del producto si no hay brand)
    let displayName = brand || product.name || "";

    // Specifications solo incluyen el model (sin el brand)
    let specifications = "";
    if (model) {
      specifications = model;
    } else if (!brand) {
      // Si no hay brand ni model, usar el nombre del producto
      specifications = product.name || "";
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
      const country =
        product.country ||
        product.countryCode ||
        product.office?.officeCountryCode ||
        "";

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
      const country =
        product.country ||
        product.countryCode ||
        product.office?.officeCountryCode ||
        "";

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

  const assetDisplayInfo = selectedAsset
    ? getAssetDisplayInfo(selectedAsset)
    : null;

  const assignmentInfo = selectedAsset
    ? getAssignmentInfo(selectedAsset)
    : null;

  // Obtener los labels de los issue types seleccionados
  const selectedIssueTypeLabels = React.useMemo(() => {
    if (!service.issueTypes) return [];
    return service.issueTypes.map((id) => issueTypesMap[id] || id);
  }, [service.issueTypes]);

  // Obtener información del impact level
  const impactLevelInfo = service.impactLevel
    ? impactLevelMap[service.impactLevel]
    : null;

  return (
    <div className="relative p-4 border border-grey rounded-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <Badge variant="outline" className="flex items-center gap-1">
          {service.serviceType === "enrollment" ? (
            <Shield className="w-3 h-3" />
          ) : service.serviceType === "buyback" ? (
            <ArrowLeftRight className="w-3 h-3" />
          ) : (
            <Wrench className="w-3 h-3" />
          )}
          Service
        </Badge>
        <button
          type="button"
          onClick={() => setIsDeleteDialogOpen(true)}
          className="hover:bg-gray-200 p-2 rounded-full transition-colors"
          aria-label="Delete service"
        >
          <Trash2 className="w-4 h-4 text-red-600" />
        </button>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl">
              Are you sure you want to delete this service? 🗑️
            </DialogTitle>
            <DialogDescription className="font-normal text-md">
              This service will be permanently removed from your quote request.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 mt-4">
            <Button
              variant="secondary"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="w-full"
            >
              Cancel
            </Button>
            <Button
              variant="delete"
              onClick={handleDelete}
              className="bg-error w-full"
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Service Type */}
      <div className="mb-3">
        <span className="font-semibold text-lg">
          {formatServiceType(service.serviceType)}
        </span>
      </div>

      {/* Enrollment: Device Counts */}
      {service.serviceType === "enrollment" && selectedAssets.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Laptop className="w-4 h-4 text-gray-600" />
            <span className="font-medium text-sm">
              {selectedAssets.length} device{selectedAssets.length !== 1 ? "s" : ""} to enroll
            </span>
          </div>
          <div className="flex gap-4">
            {deviceCounts.mac > 0 && (
              <div className="flex items-center gap-2 bg-white p-3 border border-gray-200 rounded-lg">
                <span className="text-2xl font-bold">{deviceCounts.mac}</span>
                <span className="text-sm text-gray-700">Mac</span>
              </div>
            )}
            {deviceCounts.windows > 0 && (
              <div className="flex items-center gap-2 bg-white p-3 border border-gray-200 rounded-lg">
                <span className="text-2xl font-bold">{deviceCounts.windows}</span>
                <span className="text-sm text-gray-700">Windows</span>
              </div>
            )}
            {deviceCounts.ubuntu > 0 && (
              <div className="flex items-center gap-2 bg-white p-3 border border-gray-200 rounded-lg">
                <span className="text-2xl font-bold">{deviceCounts.ubuntu}</span>
                <span className="text-sm text-gray-700">Ubuntu</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Enrollment: Selected Devices List */}
      {service.serviceType === "enrollment" && selectedAssets.length > 0 && (
        <div className="mb-3">
          <div className="font-medium text-sm mb-2">Selected devices:</div>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            {selectedAssets.map((asset) => {
              const displayInfo = getAssetDisplayInfo(asset);
              const assignment = getAssignmentInfo(asset);
              const memberName =
                assignment?.type === "employee"
                  ? assignment.member
                  : assignment?.type === "office"
                  ? assignment.officeName
                  : "";
              return (
                <li key={asset._id}>
                  {displayInfo?.displayName || asset.name || "Device"}
                  {displayInfo?.specifications && ` - ${displayInfo.specifications}`}
                  {memberName && ` - ${memberName}`}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Additional Details for Enrollment */}
      {service.serviceType === "enrollment" && service.additionalDetails && (
        <div className="mb-3">
          <div className="font-medium text-sm mb-1">Additional details:</div>
          <div className="text-sm text-gray-700">{service.additionalDetails}</div>
        </div>
      )}

      {/* Buyback: Selected Assets */}
      {service.serviceType === "buyback" && selectedAssets.length > 0 && (
        <div className="mb-3">
          <div className="font-medium text-sm mb-2">
            {selectedAssets.length} asset{selectedAssets.length !== 1 ? "s" : ""} to sell
          </div>
          <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2">
            {selectedAssets.map((asset) => {
              const displayInfo = getAssetDisplayInfo(asset);
              const assignment = getAssignmentInfo(asset);
              const memberName =
                assignment?.type === "employee"
                  ? assignment.member
                  : assignment?.type === "office"
                  ? assignment.officeName
                  : "";
              const buybackDetail = service.buybackDetails?.[asset._id];
              return (
                <li key={asset._id}>
                  <div className="font-medium">
                    {displayInfo?.displayName || asset.name || "Asset"}
                    {displayInfo?.specifications && ` - ${displayInfo.specifications}`}
                    {memberName && ` - ${memberName}`}
                  </div>
                  {buybackDetail && (
                    <div className="mt-1 text-xs text-gray-600 space-y-1">
                      {buybackDetail.generalFunctionality && (
                        <div>
                          <span className="font-medium">Overall condition: </span>
                          {buybackDetail.generalFunctionality}
                        </div>
                      )}
                      {buybackDetail.batteryCycles !== undefined && (
                        <div>
                          <span className="font-medium">Battery cycles: </span>
                          {buybackDetail.batteryCycles}
                        </div>
                      )}
                      {buybackDetail.aestheticDetails && (
                        <div>
                          <span className="font-medium">Cosmetic condition: </span>
                          {buybackDetail.aestheticDetails}
                        </div>
                      )}
                      {buybackDetail.hasCharger !== undefined && (
                        <div>
                          <span className="font-medium">Has charger: </span>
                          {buybackDetail.hasCharger ? "Yes" : "No"}
                          {buybackDetail.hasCharger && buybackDetail.chargerWorks !== undefined && (
                            <span> ({buybackDetail.chargerWorks ? "Works" : "Doesn't work"})</span>
                          )}
                        </div>
                      )}
                      {buybackDetail.additionalComments && (
                        <div>
                          <span className="font-medium">Additional comments: </span>
                          {buybackDetail.additionalComments}
                        </div>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Additional Info for Buyback */}
      {service.serviceType === "buyback" && service.additionalInfo && (
        <div className="mb-3">
          <div className="font-medium text-sm mb-1">Additional info:</div>
          <div className="text-sm text-gray-700">{service.additionalInfo}</div>
        </div>
      )}

      {/* Asset (for IT Support) */}
      {selectedAsset && service.serviceType !== "enrollment" && (
        <div className="mb-3 text-sm">
          <div className="mb-2 text-gray-700">
            <span className="font-medium">Asset: </span>
            {assetDisplayInfo?.displayName || selectedAsset.name || "Asset"}
            {assetDisplayInfo?.specifications && (
              <> ({assetDisplayInfo.specifications})</>
            )}
            {selectedAsset.serialNumber && (
              <> • SN: {selectedAsset.serialNumber}</>
            )}
          </div>
          {assignmentInfo && (
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              {assignmentInfo.type === "employee" && (
                <>
                  <span>Assigned to: {assignmentInfo.member}</span>
                  {assignmentInfo.location && (
                    <span>• {assignmentInfo.location}</span>
                  )}
                  {assignmentInfo.country && (
                    <div className="flex items-center gap-1">
                      <CountryFlag
                        countryName={assignmentInfo.country}
                        size={15}
                      />
                      <span>
                        {countriesByCode[assignmentInfo.country] ||
                          assignmentInfo.country}
                      </span>
                    </div>
                  )}
                </>
              )}
              {assignmentInfo.type === "office" && (
                <>
                  <span>Location: office {assignmentInfo.officeName}</span>
                  {assignmentInfo.country && (
                    <div className="flex items-center gap-1">
                      <CountryFlag
                        countryName={assignmentInfo.country}
                        size={15}
                      />
                      <span>
                        {countriesByCode[assignmentInfo.country] ||
                          assignmentInfo.country}
                      </span>
                    </div>
                  )}
                </>
              )}
              {assignmentInfo.type === "warehouse" && (
                <>
                  <span>FP Warehouse</span>
                  {assignmentInfo.country && (
                    <div className="flex items-center gap-1">
                      <CountryFlag
                        countryName={assignmentInfo.country}
                        size={15}
                      />
                      <span>
                        {countriesByCode[assignmentInfo.country] ||
                          assignmentInfo.country}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Issue Types */}
      {selectedIssueTypeLabels.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedIssueTypeLabels.map((label) => (
            <Badge
              key={label}
              variant="secondary"
              className="bg-gray-100 border-transparent text-gray-700"
            >
              {label}
            </Badge>
          ))}
        </div>
      )}

      {/* Description */}
      {service.description && (
        <div className="mb-3 text-gray-700 text-sm">{service.description}</div>
      )}

      {/* Impact Level */}
      {impactLevelInfo && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-700">Impact:</span>
          <Badge
            className={cn(
              "border-transparent",
              impactLevelInfo.colorClass,
              impactLevelInfo.textClass
            )}
          >
            {impactLevelInfo.label}
          </Badge>
        </div>
      )}
    </div>
  );
};
