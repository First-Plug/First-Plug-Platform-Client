"use client";

import * as React from "react";
import {
  Trash2,
  Wrench,
  Shield,
  Laptop,
  ArrowLeftRight,
  Eraser,
  Sparkles,
} from "lucide-react";
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
      enrollment: "Enrollment",
      buyback: "Buyback",
      "data-wipe": "Data Wipe",
      cleaning: "Cleaning",
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
      asset.attributes
        ?.find((attr) => String(attr.key).toLowerCase() === "brand")
        ?.value?.toLowerCase() || "";
    const model =
      asset.attributes
        ?.find((attr) => String(attr.key).toLowerCase() === "model")
        ?.value?.toLowerCase() || "";
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
          ) : service.serviceType === "data-wipe" ? (
            <Eraser className="w-3 h-3" />
          ) : service.serviceType === "cleaning" ? (
            <Sparkles className="w-3 h-3" />
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
              {selectedAssets.length} device
              {selectedAssets.length !== 1 ? "s" : ""} to enroll
            </span>
          </div>
          <div className="flex gap-4">
            {deviceCounts.mac > 0 && (
              <div className="flex items-center gap-2 bg-white p-3 border border-gray-200 rounded-lg">
                <span className="font-bold text-2xl">{deviceCounts.mac}</span>
                <span className="text-gray-700 text-sm">Mac</span>
              </div>
            )}
            {deviceCounts.windows > 0 && (
              <div className="flex items-center gap-2 bg-white p-3 border border-gray-200 rounded-lg">
                <span className="font-bold text-2xl">
                  {deviceCounts.windows}
                </span>
                <span className="text-gray-700 text-sm">Windows</span>
              </div>
            )}
            {deviceCounts.ubuntu > 0 && (
              <div className="flex items-center gap-2 bg-white p-3 border border-gray-200 rounded-lg">
                <span className="font-bold text-2xl">
                  {deviceCounts.ubuntu}
                </span>
                <span className="text-gray-700 text-sm">Ubuntu</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Enrollment: Selected Devices List */}
      {service.serviceType === "enrollment" && selectedAssets.length > 0 && (
        <div className="mb-3">
          <div className="mb-2 font-medium text-sm">Selected devices:</div>
          <ul className="space-y-1 text-gray-700 text-sm list-disc list-inside">
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
                  {displayInfo?.specifications &&
                    ` - ${displayInfo.specifications}`}
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
          <div className="mb-1 font-medium text-sm">Additional details:</div>
          <div className="text-gray-700 text-sm">
            {service.additionalDetails}
          </div>
        </div>
      )}

      {/* Buyback: Selected Assets */}
      {service.serviceType === "buyback" && selectedAssets.length > 0 && (
        <div className="mb-3">
          <div className="mb-2 font-medium text-sm">
            {selectedAssets.length} asset
            {selectedAssets.length !== 1 ? "s" : ""} to sell
          </div>
          <ul className="space-y-2 pl-5 text-gray-700 text-sm list-disc">
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
                    {displayInfo?.specifications &&
                      ` - ${displayInfo.specifications}`}
                    {memberName && ` - ${memberName}`}
                  </div>
                  {buybackDetail && (
                    <div className="space-y-1 mt-1 text-gray-600 text-xs">
                      {buybackDetail.generalFunctionality && (
                        <div>
                          <span className="font-medium">
                            Overall condition:{" "}
                          </span>
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
                          <span className="font-medium">
                            Cosmetic condition:{" "}
                          </span>
                          {buybackDetail.aestheticDetails}
                        </div>
                      )}
                      {buybackDetail.hasCharger !== undefined && (
                        <div>
                          <span className="font-medium">Has charger: </span>
                          {buybackDetail.hasCharger ? "Yes" : "No"}
                          {buybackDetail.hasCharger &&
                            buybackDetail.chargerWorks !== undefined && (
                              <span>
                                {" "}
                                (
                                {buybackDetail.chargerWorks
                                  ? "Works"
                                  : "Doesn't work"}
                                )
                              </span>
                            )}
                        </div>
                      )}
                      {buybackDetail.additionalComments && (
                        <div>
                          <span className="font-medium">
                            Additional comments:{" "}
                          </span>
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
          <div className="mb-1 font-medium text-sm">Additional info:</div>
          <div className="text-gray-700 text-sm">{service.additionalInfo}</div>
        </div>
      )}

      {/* Data Wipe: Selected Assets */}
      {service.serviceType === "data-wipe" && selectedAssets.length > 0 && (
        <div className="mb-3">
          <div className="mb-2 font-medium text-sm">
            {selectedAssets.length} asset
            {selectedAssets.length !== 1 ? "s" : ""} to wipe
          </div>
          <ul className="space-y-3 pl-5 text-gray-700 text-sm list-disc">
            {selectedAssets.map((asset) => {
              const displayInfo = getAssetDisplayInfo(asset);
              const assignment = getAssignmentInfo(asset);
              const memberName =
                assignment?.type === "employee"
                  ? assignment.member
                  : assignment?.type === "office"
                    ? assignment.officeName
                    : "";
              const dataWipeDetail = service.dataWipeDetails?.[asset._id];

              // Formatear fecha deseable - parsea YYYY-MM-DD directamente sin problemas de zona horaria
              const formatDate = (dateString?: string) => {
                if (!dateString) return null;
                try {
                  // Parsear el string YYYY-MM-DD directamente para evitar problemas de zona horaria
                  const dateMatch = dateString.match(
                    /^(\d{4})-(\d{2})-(\d{2})/
                  );
                  if (!dateMatch) return dateString;

                  const [, year, month, day] = dateMatch;

                  // Formatear como dd/MM/yyyy para coincidir con el formato del formulario
                  return `${day}/${month}/${year}`;
                } catch {
                  return dateString;
                }
              };

              return (
                <li key={asset._id}>
                  <div className="mb-1 font-medium">
                    {displayInfo?.displayName || asset.name || "Asset"}
                    {displayInfo?.specifications &&
                      ` - ${displayInfo.specifications}`}
                    {asset.serialNumber && ` • SN: ${asset.serialNumber}`}
                    {memberName && ` • ${memberName}`}
                  </div>
                  {dataWipeDetail && (
                    <div className="space-y-1 mt-2 text-gray-600 text-xs">
                      {dataWipeDetail.desirableDate && (
                        <div>
                          <span className="font-medium">Desirable date: </span>
                          {formatDate(dataWipeDetail.desirableDate)}
                        </div>
                      )}
                      {dataWipeDetail.destination && (
                        <div>
                          <span className="font-medium">
                            Return destination:{" "}
                          </span>
                          {dataWipeDetail.destination.destinationType ===
                            "Member" &&
                            dataWipeDetail.destination.member && (
                              <span>
                                {
                                  dataWipeDetail.destination.member
                                    .assignedMember
                                }
                                {dataWipeDetail.destination.member
                                  .assignedEmail &&
                                  ` (${dataWipeDetail.destination.member.assignedEmail})`}
                              </span>
                            )}
                          {dataWipeDetail.destination.destinationType ===
                            "Office" &&
                            dataWipeDetail.destination.office && (
                              <span>
                                {dataWipeDetail.destination.office.officeName}
                              </span>
                            )}
                          {dataWipeDetail.destination.destinationType ===
                            "FP warehouse" && <span>FP warehouse</span>}
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

      {/* Additional Details for Data Wipe */}
      {service.serviceType === "data-wipe" && service.additionalDetails && (
        <div className="mb-3">
          <div className="mb-1 font-medium text-sm">Additional details:</div>
          <div className="text-gray-700 text-sm">
            {service.additionalDetails}
          </div>
        </div>
      )}

      {/* Cleaning: Selected Assets */}
      {service.serviceType === "cleaning" && selectedAssets.length > 0 && (
        <div className="mb-3">
          <div className="mb-2 font-medium text-sm">
            {selectedAssets.length} asset
            {selectedAssets.length !== 1 ? "s" : ""} to clean
          </div>
          <ul className="space-y-1 pl-5 text-gray-700 text-sm list-disc">
            {selectedAssets.map((asset) => {
              const displayInfo = getAssetDisplayInfo(asset);
              return (
                <li key={asset._id}>
                  {displayInfo?.displayName || asset.name || "Asset"}
                  {displayInfo?.specifications &&
                    ` - ${displayInfo.specifications}`}
                  <span className="text-gray-500"> ({asset.category})</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Cleaning: Required date */}
      {service.serviceType === "cleaning" && service.requiredDeliveryDate && (
        <div className="mb-3 text-sm">
          <span className="font-medium">When needed by: </span>
          <span className="text-gray-700">
            {(() => {
              const d = service.requiredDeliveryDate;
              const m = d.match(/^(\d{4})-(\d{2})-(\d{2})/);
              return m ? `${m[3]}/${m[2]}/${m[1]}` : d;
            })()}
          </span>
        </div>
      )}

      {/* Cleaning: Type of cleaning */}
      {service.serviceType === "cleaning" && service.cleaningType && (
        <div className="mb-3 text-sm">
          <span className="font-medium">Type of cleaning: </span>
          <span className="text-gray-700">{service.cleaningType} cleaning</span>
        </div>
      )}

      {/* Cleaning: Additional details */}
      {service.serviceType === "cleaning" &&
        (service.additionalDetails || service.additionalComments) && (
        <div className="mb-3">
          <div className="mb-1 font-medium text-sm">Additional details:</div>
          <div className="text-gray-700 text-sm">
            {service.additionalDetails || service.additionalComments}
          </div>
        </div>
      )}

      {/* Asset (for IT Support) */}
      {selectedAsset &&
        service.serviceType !== "enrollment" &&
        service.serviceType !== "cleaning" && (
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
