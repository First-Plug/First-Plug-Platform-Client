"use client";

import * as React from "react";
import { Trash2, Wrench } from "lucide-react";
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
    };
    return serviceTypeMap[serviceType] || serviceType;
  };

  // Encontrar el asset seleccionado
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
          <Wrench className="w-3 h-3" />
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

      {/* Asset */}
      {selectedAsset && (
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
