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
  Gift,
  Package,
  Truck,
  UserMinus,
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared";
import { countriesByCode } from "@/shared/constants/country-codes";
import { useQuoteStore } from "../../store/quote.store";
import type { QuoteService } from "../../types/quote.types";
import {
  useGetTableAssets,
  Product,
  ProductTable,
  CategoryIcons,
} from "@/features/assets";
import { useFetchMembers } from "@/features/members";
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
  const { data: membersData } = useFetchMembers();
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
      donations: "Donations",
      storage: "Storage",
      "destruction-recycling": "Destruction & Recycling",
      logistics: "Logistics",
      offboarding: "Offboarding",
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

  // Formato unificado: Brand Model Name
  const getAssetDisplayInfo = (product: Product) => {
    const brand =
      product.attributes?.find(
        (attr) => String(attr.key).toLowerCase() === "brand"
      )?.value || "";
    const model =
      product.attributes?.find(
        (attr) => String(attr.key).toLowerCase() === "model"
      )?.value || "";

    const parts: string[] = [];
    if (brand) parts.push(brand);
    if (model && model !== "Other") parts.push(model);
    else if (model === "Other") parts.push("Other");

    let displayName = "";
    if (parts.length > 0) {
      displayName = product.name
        ? `${parts.join(" ")} ${product.name}`.trim()
        : parts.join(" ");
    } else {
      displayName = product.name || product.category || "Asset";
    }

    return { displayName };
  };

  // Asignación unificada: country + assignedTo (Location: Flag País Assigned to X)
  const getAssignmentInfo = (product: Product) => {
    const country =
      product.office?.officeCountryCode ||
      product.country ||
      product.countryCode ||
      "";

    if (product.assignedMember || product.assignedEmail) {
      return {
        country,
        assignedTo:
          product.assignedMember || product.assignedEmail || "Unassigned",
      };
    }
    if (product.location === "Our office") {
      const officeName =
        product.office?.officeName || product.officeName || "Our office";
      return { country, assignedTo: `Office ${officeName}` };
    }
    if (product.location === "FP warehouse") {
      return { country, assignedTo: "FP Warehouse" };
    }
    if (product.location) {
      return { country, assignedTo: product.location };
    }
    return null;
  };

  // Card unificada: Brand Model Name, SN:, Location: Flag País + office/member/FP Warehouse
  const renderUnifiedAssetCard = (
    asset: Product,
    extraContent?: React.ReactNode
  ) => {
    const displayInfo = getAssetDisplayInfo(asset);
    const assignment = getAssignmentInfo(asset);
    const countryName = assignment?.country
      ? countriesByCode[assignment.country] || assignment.country
      : "";

    return (
      <li
        key={asset._id}
        className="flex items-start gap-3 bg-gray-50 p-3 border border-gray-200 rounded-lg"
      >
        <div className="flex-shrink-0 mt-0.5">
          <CategoryIcons products={[asset]} />
        </div>
        <div className="flex flex-col flex-1 gap-1 min-w-0">
          <div className="font-semibold text-gray-900 text-sm truncate">
            {displayInfo.displayName}
          </div>
          {asset.serialNumber && (
            <div className="text-gray-600 text-xs">
              <span className="font-medium">SN:</span> {asset.serialNumber}
            </div>
          )}
          {assignment && (
            <div className="flex flex-wrap items-center gap-1 text-gray-600 text-xs">
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
                      {countryName}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {assignment.assignedTo && (
                <span>{assignment.assignedTo}</span>
              )}
            </div>
          )}
          {extraContent}
        </div>
      </li>
    );
  };

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
        <Badge
          variant="outline"
          className="flex items-center gap-1 bg-emerald-100 text-emerald-700 border border-emerald-300"
        >
          {service.serviceType === "enrollment" ? (
            <Shield className="w-3 h-3" />
          ) : service.serviceType === "buyback" ? (
            <ArrowLeftRight className="w-3 h-3" />
          ) : service.serviceType === "data-wipe" ? (
            <Eraser className="w-3 h-3" />
          ) : service.serviceType === "cleaning" ? (
            <Sparkles className="w-3 h-3" />
          ) : service.serviceType === "donations" ? (
            <Gift className="w-3 h-3" />
          ) : service.serviceType === "storage" ? (
            <Package className="w-3 h-3" />
          ) : service.serviceType === "destruction-recycling" ? (
            <Trash2 className="w-3 h-3" />
          ) : service.serviceType === "logistics" ? (
            <Truck className="w-3 h-3" />
          ) : service.serviceType === "offboarding" ? (
            <UserMinus className="w-3 h-3" />
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

      {/* Enrollment: Summary and Selected Devices List */}
      {service.serviceType === "enrollment" && selectedAssets.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Laptop className="w-4 h-4 text-gray-600" />
            <span className="font-medium text-sm">
              {selectedAssets.length} device
              {selectedAssets.length !== 1 ? "s" : ""} to enroll
            </span>
          </div>
          <ul className="flex flex-col gap-3 pl-0 list-none">
            {selectedAssets.map((asset) => renderUnifiedAssetCard(asset))}
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
          <ul className="flex flex-col gap-3 pl-0 list-none">
            {selectedAssets.map((asset) => {
              const buybackDetail = service.buybackDetails?.[asset._id];
              return renderUnifiedAssetCard(
                asset,
                buybackDetail && (
                  <div className="space-y-1 mt-1 text-gray-600 text-xs">
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
                        <span className="font-medium">
                          Cosmetic condition:{" "}
                        </span>
                        {buybackDetail.aestheticDetails}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Has charger: </span>
                      {buybackDetail.hasCharger !== false ? "Yes" : "No"}
                      {buybackDetail.hasCharger !== false &&
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
                    {buybackDetail.additionalComments && (
                      <div>
                        <span className="font-medium">
                          Additional details:{" "}
                        </span>
                        {buybackDetail.additionalComments}
                      </div>
                    )}
                  </div>
                )
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
          <ul className="flex flex-col gap-3 pl-0 list-none">
            {selectedAssets.map((asset) => {
              const dataWipeDetail = service.dataWipeDetails?.[asset._id];
              const formatDate = (dateString?: string) => {
                if (!dateString) return null;
                try {
                  const dateMatch = dateString.match(
                    /^(\d{4})-(\d{2})-(\d{2})/
                  );
                  if (!dateMatch) return dateString;
                  const [, year, month, day] = dateMatch;
                  return `${day}/${month}/${year}`;
                } catch {
                  return dateString;
                }
              };
              const dest = dataWipeDetail?.destination;
              const destCountry =
                dest?.member?.countryCode ||
                dest?.office?.countryCode ||
                dest?.warehouse?.countryCode;
              const destLabel = dest
                ? dest.destinationType === "Member" && dest.member
                  ? dest.member.assignedMember ||
                    dest.member.assignedEmail ||
                    ""
                  : dest.destinationType === "Office" && dest.office
                    ? dest.office.officeName || ""
                    : dest.destinationType === "FP warehouse"
                      ? "FP Warehouse"
                      : ""
                : "";
              return renderUnifiedAssetCard(
                asset,
                dataWipeDetail && (
                  <div className="space-y-1 mt-2 text-gray-600 text-xs">
                    {dataWipeDetail.destination && (
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="font-medium">
                          Return destination:{" "}
                        </span>
                        {destCountry && (
                          <CountryFlag
                            countryName={destCountry}
                            size={18}
                          />
                        )}
                        <span>{destLabel}</span>
                      </div>
                    )}
                    {dataWipeDetail.desirableDate && (
                      <div>
                        <span className="font-medium">
                          Desirable delivery date:{" "}
                        </span>
                        {formatDate(dataWipeDetail.desirableDate)}
                      </div>
                    )}
                  </div>
                )
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
          <ul className="flex flex-col gap-3 pl-0 list-none">
            {selectedAssets.map((asset) => renderUnifiedAssetCard(asset))}
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

      {/* Donations: Selected Assets */}
      {service.serviceType === "donations" && selectedAssets.length > 0 && (
        <div className="mb-3">
          <div className="mb-2 font-medium text-sm">
            {selectedAssets.length} asset
            {selectedAssets.length !== 1 ? "s" : ""} to donate
          </div>
          <ul className="flex flex-col gap-3 pl-0 list-none">
            {selectedAssets.map((asset) => renderUnifiedAssetCard(asset))}
          </ul>
        </div>
      )}

      {/* Donations: Additional details */}
      {service.serviceType === "donations" && service.additionalDetails && (
        <div className="mb-3">
          <div className="mb-1 font-medium text-sm">Additional details:</div>
          <div className="text-gray-700 text-sm">
            {service.additionalDetails}
          </div>
        </div>
      )}

      {/* Destruction & Recycling: Selected Assets */}
      {service.serviceType === "destruction-recycling" &&
        selectedAssets.length > 0 && (
          <div className="mb-3">
            <div className="mb-2 font-medium text-sm">
              {selectedAssets.length} asset
              {selectedAssets.length !== 1 ? "s" : ""} for destruction
            </div>
            <ul className="flex flex-col gap-3 pl-0 list-none">
              {selectedAssets.map((asset) => renderUnifiedAssetCard(asset))}
            </ul>
            {service.requiresCertificate !== undefined && (
              <div className="mt-2 text-gray-700 text-sm">
                <span className="font-medium">
                  Certificate of Destruction:{" "}
                </span>
                {service.requiresCertificate ? "Yes" : "No"}
              </div>
            )}
            {service.comments && service.comments.trim() !== "" && (
              <div className="mt-2 text-gray-700 text-sm">
                <span className="font-medium">Comments: </span>
                {service.comments}
              </div>
            )}
          </div>
        )}

      {service.serviceType === "storage" && selectedAssets.length > 0 && (
        <div className="mb-3">
          <div className="mb-2 font-medium text-sm">
            {selectedAssets.length} asset
            {selectedAssets.length !== 1 ? "s" : ""} for storage
          </div>
          <ul className="flex flex-col gap-3 pl-0 list-none">
            {selectedAssets.map((asset) => {
              const storageDetail = service.storageDetails?.[asset._id];
              return renderUnifiedAssetCard(
                asset,
                (storageDetail?.approximateSize ||
                  storageDetail?.approximateWeight ||
                  storageDetail?.approximateStorageDays ||
                  storageDetail?.additionalComments) && (
                  <div className="space-y-0.5 mt-1 text-gray-600 text-xs">
                    {storageDetail?.approximateSize && (
                      <div>Size: {storageDetail.approximateSize}</div>
                    )}
                    {storageDetail?.approximateWeight && (
                      <div>Weight: {storageDetail.approximateWeight}</div>
                    )}
                    {storageDetail?.approximateStorageDays && (
                      <div>
                        Duration: {storageDetail.approximateStorageDays}
                      </div>
                    )}
                    {storageDetail?.additionalComments && (
                      <div>
                        <span className="font-medium">
                          Additional details:{" "}
                        </span>
                        {storageDetail.additionalComments}
                      </div>
                    )}
                  </div>
                )
              );
            })}
          </ul>
        </div>
      )}

      {service.serviceType === "logistics" && selectedAssets.length > 0 && (
        <div className="mb-3">
          <div className="mb-2 font-medium text-sm">
            {selectedAssets.length} asset
            {selectedAssets.length !== 1 ? "s" : ""} to ship
          </div>
          <ul className="flex flex-col gap-3 pl-0 list-none">
            {selectedAssets.map((asset) => {
              const perAsset = service.logisticsDetailsPerAsset?.[asset._id];
              const dest =
                perAsset?.logisticsDestination ?? service.logisticsDestination;
              const pickupDate =
                perAsset?.desirablePickupDate ?? service.desirablePickupDate;
              const deliveryDate =
                perAsset?.desirableDeliveryDate ??
                service.desirableDeliveryDate;
              const shippingDetails =
                dest || pickupDate || deliveryDate ? (
                  <div className="flex flex-col gap-0.5 mt-2 pt-2 border-gray-200 border-t text-gray-700 text-xs">
                    {pickupDate && (
                      <div>
                        <span className="font-medium">Pickup: </span>
                        {pickupDate === "ASAP"
                          ? "ASAP"
                          : new Date(
                              pickupDate + "T12:00:00"
                            ).toLocaleDateString()}
                      </div>
                    )}
                    {dest && (
                      <div>
                        <span className="font-medium">Destination: </span>
                        {dest.type === "Office" && dest.officeName}
                        {dest.type === "Member" &&
                          (dest.assignedMember || dest.assignedEmail)}
                        {dest.type === "Warehouse" &&
                          (dest.warehouseName || "FP Warehouse")}
                      </div>
                    )}
                    {deliveryDate && (
                      <div>
                        <span className="font-medium">Delivery: </span>
                        {deliveryDate === "ASAP"
                          ? "ASAP"
                          : new Date(
                              deliveryDate + "T12:00:00"
                            ).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ) : null;
              return renderUnifiedAssetCard(asset, shippingDetails);
            })}
          </ul>
          {service.additionalDetails &&
            service.additionalDetails.trim() !== "" && (
              <div className="mt-2 text-gray-700 text-sm">
                <span className="font-medium">Comments: </span>
                {service.additionalDetails}
              </div>
            )}
        </div>
      )}

      {/* Offboarding: Summary and assets */}
      {service.serviceType === "offboarding" &&
        service.memberId &&
        selectedAssets.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <UserMinus className="w-4 h-4 text-gray-600" />
              <span className="font-medium text-sm">
                Offboarding{" "}
                {(() => {
                  const members = Array.isArray(membersData) ? membersData : [];
                  const member = members.find(
                    (m: any) => m._id === service.memberId
                  );
                  return member
                    ? `${(member as any).firstName || ""} ${(member as any).lastName || ""}`.trim() ||
                        (member as any).email
                    : "—";
                })()}{" "}
                · {selectedAssets.length} asset
                {selectedAssets.length !== 1 ? "s" : ""} to recover
              </span>
            </div>
            {service.offboardingPickupDate && (
              <div className="mb-2 text-gray-700 text-sm">
                <span className="font-medium">Pickup date: </span>
                {new Date(
                  service.offboardingPickupDate + "T12:00:00"
                ).toLocaleDateString()}
              </div>
            )}
            <ul className="flex flex-col gap-3 pl-0 list-none">
              {selectedAssets.map((asset) => {
                const perAsset =
                  service.offboardingDetailsPerAsset?.[asset._id];
                const dest = perAsset?.logisticsDestination;
                const deliveryDate = perAsset?.desirableDeliveryDate;
                const destLabel = dest
                  ? dest.type === "Office"
                    ? dest.officeName
                    : dest.type === "Member"
                      ? dest.assignedMember || dest.assignedEmail
                      : dest.type === "Warehouse"
                        ? "FP Warehouse"
                        : "—"
                  : null;
                const destCountryName = dest?.countryCode
                  ? (countriesByCode as Record<string, string>)[dest.countryCode] || dest.countryCode
                  : "";
                return renderUnifiedAssetCard(
                  asset,
                  (destLabel || deliveryDate) && (
                    <div className="flex flex-col gap-0.5 mt-2 pt-2 border-gray-200 border-t text-gray-700 text-xs">
                      {destLabel && (
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Destination: </span>
                          {dest?.countryCode && (
                            <TooltipProvider>
                              <Tooltip delayDuration={300}>
                                <TooltipTrigger asChild>
                                  <span className="inline-flex">
                                    <CountryFlag
                                      countryName={dest.countryCode}
                                      size={18}
                                    />
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent className="bg-blue/80 text-white text-xs">
                                  {destCountryName}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          <span>{destLabel}</span>
                        </div>
                      )}
                      {deliveryDate && (
                        <div>
                          <span className="font-medium">Delivery: </span>
                          {new Date(
                            deliveryDate + "T12:00:00"
                          ).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  )
                );
              })}
            </ul>
            {(service.offboardingSensitiveSituation !== undefined ||
              service.offboardingEmployeeAware !== undefined) && (
              <div className="space-y-0.5 mt-2 text-gray-700 text-sm">
                {service.offboardingSensitiveSituation !== undefined && (
                  <div>
                    <span className="font-medium">Sensitive situation: </span>
                    {service.offboardingSensitiveSituation ? "Yes" : "No"}
                  </div>
                )}
                {service.offboardingEmployeeAware !== undefined && (
                  <div>
                    <span className="font-medium">Employee aware: </span>
                    {service.offboardingEmployeeAware ? "Yes" : "No"}
                  </div>
                )}
              </div>
            )}
            {service.additionalComments &&
              service.additionalComments.trim() !== "" && (
                <div className="mt-2 text-gray-700 text-sm">
                  <span className="font-medium">Comments: </span>
                  {service.additionalComments}
                </div>
              )}
          </div>
        )}

      {/* Asset (for IT Support) - card unificada */}
      {selectedAsset &&
        service.serviceType !== "enrollment" &&
        service.serviceType !== "donations" &&
        service.serviceType !== "cleaning" &&
        service.serviceType !== "storage" &&
        service.serviceType !== "destruction-recycling" &&
        service.serviceType !== "logistics" &&
        service.serviceType !== "offboarding" && (
          <div className="mb-3">
            <ul className="flex flex-col gap-3 pl-0 list-none">
              {renderUnifiedAssetCard(selectedAsset)}
            </ul>
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
        <div className="mb-3 text-gray-700 text-sm">
          <span className="font-medium">Description: </span>
          {service.description}
        </div>
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
