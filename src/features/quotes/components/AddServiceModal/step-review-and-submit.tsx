"use client";

import * as React from "react";
import {
  Badge,
  CountryFlag,
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
import { MapPin, AlertTriangle, CheckCircle2 } from "lucide-react";
import { countriesByCode } from "@/shared/constants/country-codes";
import type { QuoteService } from "../../types/quote.types";

interface StepReviewAndSubmitProps {
  serviceData: QuoteService;
  onSubmit: () => void;
}

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
  low: {
    label: "Low - Minor inconvenience",
    colorClass: "bg-success",
    textClass: "text-white",
  },
  medium: {
    label: "Medium - Affects productivity",
    colorClass: "bg-lightYellow",
    textClass: "text-black",
  },
  high: {
    label: "High - Cannot work",
    colorClass: "bg-error",
    textClass: "text-white",
  },
};

export const StepReviewAndSubmit: React.FC<StepReviewAndSubmitProps> = ({
  serviceData,
  onSubmit,
}) => {
  const { data: assetsData, isLoading } = useGetTableAssets();

  // Encontrar el asset seleccionado
  const selectedAsset = React.useMemo(() => {
    if (!serviceData.assetId || !assetsData) return null;

    for (const categoryGroup of assetsData) {
      if (categoryGroup.products) {
        const asset = categoryGroup.products.find(
          (p) => p._id === serviceData.assetId
        );
        if (asset) return asset;
      }
    }
    return null;
  }, [serviceData.assetId, assetsData]);

  // Obtener información de asignación estandarizada
  const getAssignmentInfo = (product: Product) => {
    const country =
      product.office?.officeCountryCode ||
      product.country ||
      product.countryCode ||
      "";

    if (product.assignedMember || product.assignedEmail) {
      const assignedTo =
        product.assignedMember || product.assignedEmail || "Unassigned";
      return {
        type: "employee" as const,
        country,
        assignedTo,
      };
    }

    if (product.location === "Our office") {
      const officeName =
        product.office?.officeName || product.officeName || "Our office";
      return {
        type: "office" as const,
        country,
        assignedTo: `Office ${officeName}`,
      };
    }

    if (product.location === "FP warehouse") {
      return {
        type: "warehouse" as const,
        country,
        assignedTo: "FP Warehouse",
      };
    }

    if (product.location) {
      return {
        type: "other" as const,
        country,
        assignedTo: product.location,
      };
    }

    return null;
  };

  // Obtener nombre estandarizado: Brand Model (Name)
  const getAssetDisplayInfo = (product: Product) => {
    const brand = product.attributes?.find(
      (attr) => String(attr.key).toLowerCase() === "brand"
    )?.value || "";
    const model = product.attributes?.find(
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
      displayName = product.name || "Asset";
    }

    return { displayName };
  };

  // Obtener los labels de los issue types seleccionados
  const selectedIssueTypeLabels = React.useMemo(() => {
    if (!serviceData.issueTypes) return [];
    return serviceData.issueTypes.map((id) => issueTypesMap[id] || id);
  }, [serviceData.issueTypes]);

  // Obtener información del impact level
  const impactLevelInfo = serviceData.impactLevel
    ? impactLevelMap[serviceData.impactLevel]
    : null;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const assignmentInfo = selectedAsset
    ? getAssignmentInfo(selectedAsset)
    : null;
  const assetDisplayInfo = selectedAsset
    ? getAssetDisplayInfo(selectedAsset)
    : null;

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header con checkmark */}
      <div className="flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5 text-green-500" />
        <p className="text-muted-foreground">
          Review your IT support request before submitting
        </p>
      </div>

      {/* Selected Asset */}
      {selectedAsset && (
        <div className="flex flex-col gap-3">
          <h3 className="font-semibold text-lg">Selected Asset</h3>
          <div className="flex items-start gap-4 bg-white p-4 border-2 border-gray-200 rounded-lg">
            <div className="flex-shrink-0">
              <CategoryIcons products={[selectedAsset]} />
            </div>
            <div className="flex flex-col flex-1 gap-1">
              {/* Line 1: Brand Model (Name) */}
              <span className="font-semibold text-sm">
                {assetDisplayInfo?.displayName ||
                  selectedAsset.name ||
                  "Asset"}
              </span>

              {/* Line 2: SN */}
              {selectedAsset.serialNumber && (
                <div className="text-gray-600 text-xs">
                  <span className="font-medium">SN:</span>{" "}
                  {selectedAsset.serialNumber}
                </div>
              )}

              {/* Line 3: Location: Flag (tooltip país) + office/member/FP Warehouse */}
              {assignmentInfo && (
                <div className="flex items-center gap-1 text-gray-600 text-xs">
                  <span className="font-medium">Location:</span>
                  {assignmentInfo.country && (
                    <TooltipProvider>
                      <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                          <span className="inline-flex">
                            <CountryFlag
                              countryName={assignmentInfo.country}
                              size={18}
                            />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="bg-blue/80 text-white text-xs">
                          {countriesByCode[assignmentInfo.country] ||
                            assignmentInfo.country}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  {assignmentInfo.country && assignmentInfo.assignedTo && (
                    <span className="text-muted-foreground"> - </span>
                  )}
                  {assignmentInfo.assignedTo && (
                    <span>{assignmentInfo.assignedTo}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Issue Types */}
      {selectedIssueTypeLabels.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="font-semibold text-lg">Issue Types</h3>
          <div className="flex flex-wrap gap-2">
            {selectedIssueTypeLabels.map((label) => (
              <Badge
                key={label}
                variant="secondary"
                className="bg-gray-100 text-gray-700"
              >
                {label}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      {serviceData.description && (
        <div className="flex flex-col gap-3">
          <h3 className="font-semibold text-lg">Description</h3>
          <div className="bg-white p-4 border-2 border-gray-200 rounded-lg">
            <p className="text-gray-700 text-sm whitespace-pre-wrap">
              {serviceData.description}
            </p>
          </div>
        </div>
      )}

      {/* Additional Details */}
      {impactLevelInfo && (
        <div className="flex flex-col gap-3">
          <h3 className="font-semibold text-lg">Additional Details</h3>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <span className="text-muted-foreground text-sm">Impact level:</span>
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
        </div>
      )}
    </div>
  );
};
