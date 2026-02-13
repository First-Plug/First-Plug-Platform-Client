"use client";

import * as React from "react";
import * as Switch from "@radix-ui/react-switch";
import { Eraser, Sparkles } from "lucide-react";
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

interface StepDonationDetailsProps {
  assetIds: string[];
  donationDataWipe?: boolean;
  donationProfessionalCleaning?: boolean;
  additionalDetails?: string;
  onDataChange: (updates: {
    donationDataWipe?: boolean;
    donationProfessionalCleaning?: boolean;
    additionalDetails?: string;
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

  return { displayName, brand, model, name };
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

  // Assigned to employee
  if (product.assignedMember || product.assignedEmail) {
    const assignedTo =
      product.assignedMember || product.assignedEmail || "Unassigned";
    return { type: "employee", location: product.location || "Employee", assignedTo, country };
  }

  // Our office
  if (product.location === "Our office") {
    const officeName =
      product.office?.officeName || product.officeName || "Our office";
    return { type: "office", location: "Our office", assignedTo: `Office ${officeName}`, country };
  }

  // FP warehouse
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

export const StepDonationDetails: React.FC<StepDonationDetailsProps> = ({
  assetIds,
  donationDataWipe = false,
  donationProfessionalCleaning = false,
  additionalDetails,
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
      {/* Assets to donate */}
      <div className="flex flex-col gap-2">
        <Label className="font-medium text-sm">
          Assets to donate ({selectedAssets.length})
        </Label>
        <div className="bg-white p-4 border border-gray-200 rounded-lg">
          {selectedAssets.length === 0 ? (
            <p className="text-muted-foreground text-sm">No assets selected.</p>
          ) : (
            <ul className="flex flex-col gap-3">
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
                          {normalizedCountryCode && assignedTo && (
                            <span className="text-muted-foreground"> - </span>
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
          )}
        </div>
      </div>

      {/* Preparation options */}
      <div className="flex flex-col gap-3">
        <Label className="font-medium text-sm">Preparation options</Label>

        {/* Data wipe */}
        <div className="flex justify-between items-start gap-4 bg-white p-4 border border-gray-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="flex flex-shrink-0 justify-center items-center bg-red-50 border border-red-200 rounded-full w-10 h-10">
              <Eraser className="w-5 h-5 text-red-600" strokeWidth={2} />
            </div>
            <div>
              <span className="block font-semibold text-sm">Data wipe</span>
              <span className="text-muted-foreground text-sm">
                Securely erase all data from devices before donation
              </span>
            </div>
          </div>

          <Switch.Root
            checked={donationDataWipe}
            onCheckedChange={(checked) =>
              onDataChange({ donationDataWipe: checked })
            }
            className={cn(
              "relative flex-shrink-0 rounded-full w-10 h-6 transition-colors duration-200",
              donationDataWipe ? "bg-blue" : "bg-gray-300"
            )}
          >
            <Switch.Thumb
              className={cn(
                "block bg-white shadow-md rounded-full w-4 h-4 transform-gpu transition-transform duration-200",
                donationDataWipe ? "translate-x-5" : "translate-x-1"
              )}
            />
          </Switch.Root>
        </div>

        {/* Professional cleaning */}
        <div className="flex justify-between items-start gap-4 bg-white p-4 border border-gray-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="flex flex-shrink-0 justify-center items-center bg-blue/10 border border-blue/20 rounded-full w-10 h-10">
              <Sparkles className="w-5 h-5 text-blue" strokeWidth={2} />
            </div>
            <div>
              <span className="block font-semibold text-sm">
                Professional cleaning
              </span>
              <span className="text-muted-foreground text-sm">
                Clean and sanitize devices before donation
              </span>
            </div>
          </div>

          <Switch.Root
            checked={donationProfessionalCleaning}
            onCheckedChange={(checked) =>
              onDataChange({ donationProfessionalCleaning: checked })
            }
            className={cn(
              "relative flex-shrink-0 rounded-full w-10 h-6 transition-colors duration-200",
              donationProfessionalCleaning ? "bg-blue" : "bg-gray-300"
            )}
          >
            <Switch.Thumb
              className={cn(
                "block bg-white shadow-md rounded-full w-4 h-4 transform-gpu transition-transform duration-200",
                donationProfessionalCleaning ? "translate-x-5" : "translate-x-1"
              )}
            />
          </Switch.Root>
        </div>
      </div>

      {/* Additional details */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="donation-details" className="font-medium text-sm">
          Additional details
        </Label>
        <textarea
          id="donation-details"
          placeholder="Any special instructions or notes for the donation..."
          value={additionalDetails || ""}
          onChange={(e) =>
            onDataChange({ additionalDetails: e.target.value || undefined })
          }
          rows={6}
          className="flex bg-background disabled:opacity-50 px-3 py-2 border border-input rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ring-offset-background focus-visible:ring-offset-2 w-full min-h-[120px] placeholder:text-muted-foreground text-sm disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );
};
