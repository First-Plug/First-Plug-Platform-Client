"use client";

import * as React from "react";
import * as Switch from "@radix-ui/react-switch";
import { AlertTriangle, FileCheck } from "lucide-react";
import { Label } from "@/shared/components/ui/label";
import { cn } from "@/shared";
import {
  useGetTableAssets,
  Product,
  ProductTable,
  CategoryIcons,
} from "@/features/assets";
import {
  CountryFlag,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared";
import { countriesByCode } from "@/shared/constants/country-codes";
import { normalizeCountryCode } from "@/shared/utils/countryCodeNormalizer";

interface StepDestructionOptionsProps {
  assetIds: string[];
  requiresCertificate?: boolean;
  comments?: string;
  onDataChange: (updates: {
    requiresCertificate?: boolean;
    comments?: string;
  }) => void;
}

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

  const name = (product.name || "").trim();

  const parts: string[] = [];
  if (brand) parts.push(brand);
  if (model && model !== "Other") parts.push(model);
  else if (model === "Other") parts.push("Other");

  let displayName = "";
  if (parts.length > 0) {
    displayName = name ? `${parts.join(" ")} ${name}`.trim() : parts.join(" ");
  } else {
    displayName = name || product.category || "Asset";
  }

  return { displayName };
};

type AssignmentInfo =
  | {
      type: "employee";
      location: string;
      assignedTo: string;
      country: string;
    }
  | {
      type: "office";
      location: string;
      assignedTo: string;
      country: string;
    }
  | {
      type: "warehouse";
      location: string;
      assignedTo: string;
      country: string;
    }
  | {
      type: "other";
      location: string;
      assignedTo?: string;
      country?: string;
    }
  | null;

const getAssignmentInfo = (product: Product): AssignmentInfo => {
  const country =
    product.office?.officeCountryCode ||
    product.country ||
    product.countryCode ||
    "";

  if (product.assignedMember || product.assignedEmail) {
    const assignedTo =
      product.assignedMember || product.assignedEmail || "Unassigned";
    return { type: "employee", location: product.location || "Employee", assignedTo, country };
  }

  if (product.location === "Our office") {
    const officeName =
      product.office?.officeName || product.officeName || "Our office";
    return { type: "office", location: "Our office", assignedTo: `Office ${officeName}`, country };
  }

  if (product.location === "FP warehouse") {
    return {
      type: "warehouse",
      location: "FP warehouse",
      assignedTo: "FP Warehouse",
      country,
    };
  }

  if (product.location) {
    return { type: "other", location: product.location };
  }

  return null;
};

export const StepDestructionOptions: React.FC<StepDestructionOptionsProps> = ({
  assetIds,
  requiresCertificate = true,
  comments,
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

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Important Notice */}
      <div className="flex gap-3 bg-amber-50 p-4 border border-amber-200 rounded-lg">
        <AlertTriangle className="flex-shrink-0 w-5 h-5 text-amber-600" />
        <p className="text-amber-800 text-sm">
          <span className="font-semibold">Important Notice:</span> Destruction
          is permanent and irreversible. All data on these assets will be
          securely destroyed.
        </p>
      </div>

      {/* Assets for Destruction */}
      {selectedAssets.length > 0 && (
        <div className="flex flex-col gap-2">
          <Label className="font-medium text-sm">
            Assets for Destruction ({selectedAssets.length})
          </Label>
          <div className="bg-white p-4 border border-gray-200 rounded-lg">
            <ul className="flex flex-col gap-3 pl-0 list-none">
              {selectedAssets.map((asset) => {
                const { displayName } = getAssetDisplayInfo(asset);
                const assignment = getAssignmentInfo(asset);
                const rawCountryCode =
                  assignment && "country" in assignment
                    ? assignment.country
                    : "";
                const normalizedCountryCode = rawCountryCode
                  ? normalizeCountryCode(rawCountryCode) || rawCountryCode
                  : "";
                const countryName = normalizedCountryCode
                  ? countriesByCode[normalizedCountryCode] ||
                    normalizedCountryCode
                  : "";

                const assignedTo = (() => {
                  if (!assignment) return "";
                  return assignment.assignedTo || "";
                })();

                return (
                  <li
                    key={asset._id}
                    className="flex items-start gap-3 bg-gray-50 p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <CategoryIcons products={[asset]} />
                    </div>

                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="font-semibold text-gray-900 text-sm truncate">
                        {displayName}
                      </div>

                      {asset.serialNumber && (
                        <div className="text-gray-600 text-xs">
                          <span className="font-medium">SN:</span>{" "}
                          {asset.serialNumber}
                        </div>
                      )}

                      {assignment && (
                        <div className="flex items-center gap-1 text-gray-600 text-xs">
                          <span className="font-medium">Location:</span>
                          {normalizedCountryCode && (
                            <TooltipProvider>
                              <Tooltip delayDuration={300}>
                                <TooltipTrigger asChild>
                                  <span className="inline-flex">
                                    <CountryFlag
                                      countryName={normalizedCountryCode}
                                      size={18}
                                    />
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent className="bg-blue/80 text-white text-xs">
                                  {countryName || "N/A"}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          {assignedTo && (
                            <span>{assignedTo}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

      {/* Certificate of Destruction */}
      <div className="flex flex-col gap-3 bg-white p-4 border border-gray-200 rounded-lg">
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-start gap-3">
            <div className="flex flex-shrink-0 justify-center items-center bg-blue/10 border border-blue/20 rounded-full w-10 h-10">
              <FileCheck className="w-5 h-5 text-blue" strokeWidth={2} />
            </div>
            <div>
              <span className="block font-semibold text-sm">
                Certificate of Destruction
              </span>
              <span className="text-muted-foreground text-sm">
                Receive an official certificate confirming secure data
                destruction
              </span>
            </div>
          </div>
          <Switch.Root
            checked={requiresCertificate}
            onCheckedChange={(checked) => {
              onDataChange({ requiresCertificate: checked });
            }}
            className={cn(
              "relative flex-shrink-0 rounded-full w-10 h-6 transition-colors duration-200",
              requiresCertificate ? "bg-blue" : "bg-gray-300"
            )}
          >
            <Switch.Thumb
              className={cn(
                "block bg-white shadow-md rounded-full w-4 h-4 transform-gpu transition-transform duration-200",
                requiresCertificate ? "translate-x-5" : "translate-x-1"
              )}
            />
          </Switch.Root>
        </div>
      </div>

      {/* Additional details */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="destruction-comments" className="font-medium text-sm">
          Additional details
        </Label>
        <textarea
          id="destruction-comments"
          placeholder="Any special instructions or requirements..."
          value={comments || ""}
          onChange={(e) =>
            onDataChange({ comments: e.target.value || undefined })
          }
          rows={4}
          className="flex bg-background disabled:opacity-50 px-3 py-2 border border-input rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ring-offset-background focus-visible:ring-offset-2 w-full min-h-[80px] placeholder:text-muted-foreground text-sm disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );
};
