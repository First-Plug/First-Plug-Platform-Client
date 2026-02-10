"use client";

import * as React from "react";
import { format, startOfToday } from "date-fns";
import { CalendarIcon, Package, ChevronDown, ChevronUp, UserMinus, AlertTriangle } from "lucide-react";
import * as Switch from "@radix-ui/react-switch";
import { Label } from "@/shared/components/ui/label";
import { Button } from "@/shared/components/ui/button";
import { Calendar } from "@/shared/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { cn } from "@/shared";
import { useGetTableAssets, Product, ProductTable } from "@/features/assets";
import { useFetchMembers } from "@/features/members";
import { useOffices } from "@/features/settings";
import SelectDropdownOptions from "@/shared/components/select-dropdown-options";
import { CountryFlag, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared";
import { countriesByCode } from "@/shared/constants/country-codes";
import type {
  LogisticsDestination,
  OffboardingDetailPerAsset,
} from "@/features/quotes/types/quote.types";

function parseDateOnly(str: string | undefined): Date | undefined {
  if (!str) return undefined;
  const m = str.match(/^(\d{4})[-\/](\d{2})[-\/](\d{2})/);
  if (!m) return undefined;
  const [, y, mo, d] = m;
  return new Date(parseInt(y), parseInt(mo) - 1, parseInt(d), 12, 0, 0);
}

function toDateOnlyTimestamp(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

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
    displayName = product.name || "No name";
  }
  return { displayName };
};

const getLocationLabel = (product: Product): string => {
  if (product.assignedMember || product.assignedEmail) {
    return String(product.assignedMember || product.assignedEmail || "Unassigned");
  }
  if (product.location === "Our office") {
    return String(
      (product as any).office?.officeName || (product as any).officeName || "Our office"
    );
  }
  if (product.location === "FP warehouse") return "FP warehouse";
  return product.location || "";
};

function getOriginLabel(product: Product): string {
  const location = getLocationLabel(product);
  const countryCode =
    (product as any).office?.country ||
    (product as any).officeCountryCode ||
    product.countryCode ||
    (product as any).country ||
    "";
  const countryName = countryCode ? countriesByCode[countryCode] || countryCode : "";
  if (!countryName) return `Origin: ${location}`;
  return `Origin: ${location} • ${countryName}`;
}

function getOriginCountryCode(product: Product): string {
  return (
    (product as any).office?.country ||
    (product as any).officeCountryCode ||
    product.countryCode ||
    (product as any).country ||
    ""
  );
}

function getDestinationCountryCode(dest: LogisticsDestination | undefined): string {
  if (!dest) return "";
  return dest.countryCode || "";
}

function getDestinationValue(dest: LogisticsDestination | undefined): string {
  if (!dest || !dest.type) return "";
  if (dest.type === "Office" && dest.officeId) return `office_${dest.officeId}`;
  if (dest.type === "Member" && dest.memberId) return `member_${dest.memberId}`;
  if (dest.type === "Warehouse") return "FP warehouse";
  return "";
}

interface StepOffboardingDetailsProps {
  memberId: string;
  assetIds: string[];
  offboardingPickupDate?: string;
  offboardingSameDetailsForAllAssets?: boolean;
  offboardingDetailsPerAsset?: Record<string, OffboardingDetailPerAsset>;
  offboardingSensitiveSituation?: boolean;
  offboardingEmployeeAware?: boolean;
  additionalComments?: string;
  onDataChange: (updates: {
    offboardingPickupDate?: string;
    offboardingSameDetailsForAllAssets?: boolean;
    offboardingDetailsPerAsset?: Record<string, OffboardingDetailPerAsset>;
    offboardingSensitiveSituation?: boolean;
    offboardingEmployeeAware?: boolean;
    additionalComments?: string;
  }) => void;
}

export const StepOffboardingDetails: React.FC<StepOffboardingDetailsProps> = ({
  memberId,
  assetIds,
  offboardingPickupDate,
  offboardingSameDetailsForAllAssets = false,
  offboardingDetailsPerAsset,
  offboardingSensitiveSituation = false,
  offboardingEmployeeAware = true,
  additionalComments,
  onDataChange,
}) => {
  const { data: assetsData } = useGetTableAssets();
  const { data: membersData } = useFetchMembers();
  const { offices: officesData } = useOffices();

  const today = startOfToday();
  const [pickupCalendarOpen, setPickupCalendarOpen] = React.useState(false);
  const [expandedAssetIds, setExpandedAssetIds] = React.useState<Set<string>>(
    () => (assetIds?.length ? new Set([assetIds[0]]) : new Set())
  );
  const [perAssetDeliveryOpen, setPerAssetDeliveryOpen] = React.useState<Record<string, boolean>>({});

  const members = React.useMemo(() => {
    if (!membersData || !Array.isArray(membersData)) return [];
    return membersData;
  }, [membersData]);

  const offices = React.useMemo(() => {
    if (!officesData || !Array.isArray(officesData)) return [];
    return [...officesData].sort((a, b) => {
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      return 0;
    });
  }, [officesData]);

  const selectedMember = React.useMemo(
    () => members.find((m: any) => m._id === memberId),
    [members, memberId]
  );
  const memberName = selectedMember
    ? `${(selectedMember as any).firstName || ""} ${(selectedMember as any).lastName || ""}`.trim() ||
      (selectedMember as any).email
    : "—";

  const selectedAssets = React.useMemo(() => {
    if (!assetIds?.length || !assetsData) return [];
    const productsMap = new Map<string, Product>();
    for (const categoryGroup of assetsData as ProductTable[]) {
      if (categoryGroup.products) {
        categoryGroup.products.forEach((p) => productsMap.set(p._id, p));
      }
    }
    const assets: Product[] = [];
    assetIds.forEach((id) => {
      const asset = productsMap.get(id);
      if (asset) assets.push(asset);
    });
    return assets;
  }, [assetIds, assetsData]);

  const destinationOptionGroups = React.useMemo(() => {
    const groups: { label: string; options: { display: React.ReactNode; value: string }[] }[] = [];
    if (members.length > 0) {
      groups.push({
        label: "Members",
        options: members.map((m: any) => ({
          display: `${m.firstName || ""} ${m.lastName || ""}`.trim() || m.email,
          value: `member_${m._id}`,
        })),
      });
    }
    if (offices.length > 0) {
      groups.push({
        label: "Offices",
        options: offices.map((office) => {
          const countryName = office.country
            ? countriesByCode[office.country] || office.country
            : "";
          const displayLabel = countryName ? `${countryName} - ${office.name}` : office.name;
          return {
            display: (
              <>
                {office.country && (
                  <TooltipProvider>
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger asChild>
                        <div>
                          <CountryFlag
                            countryName={office.country}
                            size={16}
                            className="rounded-sm"
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="bg-blue/80 text-white text-xs">
                        {countryName || office.country}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                <span className="truncate">{displayLabel}</span>
              </>
            ),
            value: `office_${office._id}`,
          };
        }),
      });
    }
    return groups;
  }, [members, offices]);

  const parseDestinationFromValue = (selectedValue: string): LogisticsDestination | undefined => {
    if (!selectedValue) return undefined;
    if (selectedValue === "FP warehouse") return { type: "Warehouse" };
    const [type, id] = selectedValue.split("_");
    if (type === "member") {
      const member = members.find((m: any) => m._id === id);
      if (!member) return undefined;
      const m = member as any;
      return {
        type: "Member",
        memberId: m._id || "",
        assignedMember: `${m.firstName || ""} ${m.lastName || ""}`.trim() || m.email,
        assignedEmail: m.email || "",
        countryCode: m.countryCode || m.country || "",
      };
    }
    if (type === "office") {
      const office = offices.find((o) => o._id === id);
      if (!office) return undefined;
      return {
        type: "Office",
        officeId: office._id,
        officeName: office.name,
        countryCode: office.country || "",
      };
    }
    return undefined;
  };

  const getPerAssetDetail = (assetId: string): OffboardingDetailPerAsset =>
    offboardingDetailsPerAsset?.[assetId] || {};

  const toggleAssetExpanded = (assetId: string) => {
    setExpandedAssetIds((prev) => {
      const next = new Set(prev);
      if (next.has(assetId)) next.delete(assetId);
      else next.add(assetId);
      return next;
    });
  };

  // Intercountry: count assets where origin country !== destination country
  const intercountryAssets = React.useMemo(() => {
    return selectedAssets.filter((asset) => {
      const origin = getOriginCountryCode(asset);
      const detail = getPerAssetDetail(asset._id);
      const dest = offboardingSameDetailsForAllAssets
        ? getPerAssetDetail(selectedAssets[0]?._id)?.logisticsDestination
        : detail.logisticsDestination;
      const destCountry = getDestinationCountryCode(dest);
      return origin && destCountry && origin !== destCountry;
    });
  }, [
    selectedAssets,
    offboardingSameDetailsForAllAssets,
    offboardingDetailsPerAsset,
  ]);

  const isAssetIntercountry = (asset: Product): boolean => {
    const origin = getOriginCountryCode(asset);
    const detail = getPerAssetDetail(asset._id);
    const dest = offboardingSameDetailsForAllAssets
      ? selectedAssets[0]
        ? getPerAssetDetail(selectedAssets[0]._id).logisticsDestination
        : undefined
      : detail.logisticsDestination;
    const destCountry = getDestinationCountryCode(dest);
    return !!(origin && destCountry && origin !== destCountry);
  };

  const getIntercountryLabel = (asset: Product): string => {
    const origin = getOriginCountryCode(asset);
    const detail = getPerAssetDetail(asset._id);
    const dest = offboardingSameDetailsForAllAssets
      ? selectedAssets[0]
        ? getPerAssetDetail(selectedAssets[0]._id).logisticsDestination
        : undefined
      : detail.logisticsDestination;
    const destCountry = getDestinationCountryCode(dest);
    const originName = origin ? countriesByCode[origin] || origin : "";
    const destName = destCountry ? countriesByCode[destCountry] || destCountry : "";
    return `${originName} → ${destName}`;
  };

  const handleDestinationForAsset = (assetId: string, selectedValue: string) => {
    const dest = parseDestinationFromValue(selectedValue);
    onDataChange({
      offboardingDetailsPerAsset: {
        ...offboardingDetailsPerAsset,
        [assetId]: { ...getPerAssetDetail(assetId), logisticsDestination: dest },
      },
    });
  };

  const handleDeliveryDateForAsset = (assetId: string, dateStr: string | undefined) => {
    onDataChange({
      offboardingDetailsPerAsset: {
        ...offboardingDetailsPerAsset,
        [assetId]: { ...getPerAssetDetail(assetId), desirableDeliveryDate: dateStr },
      },
    });
  };

  const handleGlobalDestination = (selectedValue: string) => {
    const dest = parseDestinationFromValue(selectedValue);
    if (!assetIds.length) return;
    const next: Record<string, OffboardingDetailPerAsset> = {};
    assetIds.forEach((id) => {
      next[id] = { ...getPerAssetDetail(id), logisticsDestination: dest };
    });
    onDataChange({ offboardingDetailsPerAsset: next });
  };

  const handleGlobalDeliveryDate = (dateStr: string) => {
    if (!assetIds.length) return;
    const next: Record<string, OffboardingDetailPerAsset> = {};
    assetIds.forEach((id) => {
      next[id] = { ...getPerAssetDetail(id), desirableDeliveryDate: dateStr };
    });
    onDataChange({ offboardingDetailsPerAsset: next });
  };

  const globalDest = assetIds.length
    ? getPerAssetDetail(assetIds[0]).logisticsDestination
    : undefined;
  const globalDeliveryDate = assetIds.length
    ? getPerAssetDetail(assetIds[0]).desirableDeliveryDate
    : undefined;
  const globalDestValue = getDestinationValue(globalDest);

  if (selectedAssets.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <p className="text-muted-foreground">No assets to configure.</p>
      </div>
    );
  }

  const renderDestinationAndDelivery = (opts: {
    destinationValue: string;
    onDestinationChange: (v: string) => void;
    deliveryDate?: string;
    onDeliveryDate: (dateStr: string) => void;
    deliveryOpen: boolean;
    setDeliveryOpen: (v: boolean) => void;
    disabled?: boolean;
    originCountryCode?: string;
    showIntercountryAlert?: boolean;
    intercountryLabel?: string;
  }) => {
    const deliveryVal = parseDateOnly(opts.deliveryDate);
    const deliveryDisabled = (date: Date) => {
      const d = toDateOnlyTimestamp(date);
      if (d < toDateOnlyTimestamp(today)) return true;
      return false;
    };

    return (
      <>
        <div className="flex flex-col gap-2">
          <SelectDropdownOptions
            label="Destination"
            placeholder="Select destination"
            value={opts.destinationValue}
            onChange={opts.onDestinationChange}
            options={["FP warehouse"]}
            optionGroups={destinationOptionGroups}
            required
            compact={true}
            quotesFormStyle
            disabled={opts.disabled}
          />
          {opts.showIntercountryAlert && opts.intercountryLabel && (
            <div className="flex items-start gap-2 text-destructive text-sm mt-1">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                This is an intercountry shipment ({opts.intercountryLabel})
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-sm font-medium">
            Delivery Date <span className="text-destructive">*</span>
          </Label>
          <Popover open={opts.deliveryOpen} onOpenChange={opts.setDeliveryOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                disabled={opts.disabled}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !opts.deliveryDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {opts.deliveryDate
                  ? format(deliveryVal!, "PPP")
                  : "Select delivery date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={deliveryVal}
                onSelect={(date) => {
                  if (date) {
                    opts.onDeliveryDate(format(date, "yyyy-MM-dd"));
                    opts.setDeliveryOpen(false);
                  }
                }}
                disabled={deliveryDisabled}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </>
    );
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Summary card */}
      <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg bg-gray-50/50">
        <div className="flex justify-center items-center bg-blue/10 border border-blue/20 rounded-full w-10 h-10 shrink-0">
          <UserMinus className="w-5 h-5 text-blue" />
        </div>
        <div>
          <p className="font-medium text-black">Offboarding {memberName}</p>
          <p className="text-muted-foreground text-sm">
            Configure recovery for {selectedAssets.length} asset
            {selectedAssets.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Pickup Date */}
      <div className="flex flex-col gap-2">
        <Label className="text-sm font-medium">
          Pickup Date <span className="text-destructive">*</span>
        </Label>
        <Popover open={pickupCalendarOpen} onOpenChange={setPickupCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full max-w-xs justify-start text-left font-normal",
                !offboardingPickupDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {offboardingPickupDate
                ? format(parseDateOnly(offboardingPickupDate)!, "PPP")
                : "Select pickup date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={parseDateOnly(offboardingPickupDate)}
              onSelect={(date) => {
                if (date) {
                  onDataChange({ offboardingPickupDate: format(date, "yyyy-MM-dd") });
                  setPickupCalendarOpen(false);
                }
              }}
              disabled={(date) => toDateOnlyTimestamp(date) < toDateOnlyTimestamp(today)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Same details for all assets */}
      <div className="flex justify-between items-start gap-4 bg-white p-4 border border-gray-200 rounded-lg">
        <div>
          <p className="font-medium text-sm">Same details for all assets</p>
          <p className="text-muted-foreground text-sm">
            Apply the same destination and delivery date to all assets
          </p>
        </div>
        <Switch.Root
          checked={offboardingSameDetailsForAllAssets}
          onCheckedChange={(checked) => {
            onDataChange({ offboardingSameDetailsForAllAssets: checked });
            if (checked && assetIds.length > 0) {
              const first = getPerAssetDetail(assetIds[0]);
              const next: Record<string, OffboardingDetailPerAsset> = {};
              assetIds.forEach((id) => {
                next[id] = {
                  logisticsDestination: first.logisticsDestination,
                  desirableDeliveryDate: first.desirableDeliveryDate,
                };
              });
              onDataChange({ offboardingDetailsPerAsset: next });
            }
          }}
          className={cn(
            "relative flex-shrink-0 rounded-full w-10 h-6 transition-colors duration-200",
            offboardingSameDetailsForAllAssets ? "bg-blue" : "bg-gray-300"
          )}
        >
          <Switch.Thumb
            className={cn(
              "block bg-white shadow-md rounded-full w-4 h-4 transform-gpu transition-transform duration-200",
              offboardingSameDetailsForAllAssets ? "translate-x-5" : "translate-x-1"
            )}
          />
        </Switch.Root>
      </div>

      {offboardingSameDetailsForAllAssets && (
        <div className="flex flex-col gap-4 p-4 border border-gray-200 rounded-lg bg-white">
          <div className="gap-4 grid grid-cols-2">
            {renderDestinationAndDelivery({
              destinationValue: globalDestValue,
              onDestinationChange: handleGlobalDestination,
              deliveryDate: globalDeliveryDate,
              onDeliveryDate: handleGlobalDeliveryDate,
              deliveryOpen: perAssetDeliveryOpen["_global"] ?? false,
              setDeliveryOpen: (v) =>
                setPerAssetDeliveryOpen((prev) => ({ ...prev, _global: v })),
            })}
          </div>
        </div>
      )}

      {/* Intercountry banner */}
      {intercountryAssets.length > 0 && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm">
            Intercountry shipping detected. {intercountryAssets.length} asset
            {intercountryAssets.length !== 1 ? "s" : ""} require
            international shipping, which is usually significantly more expensive
            and takes longer to deliver.
          </p>
        </div>
      )}

      {/* Asset Destinations */}
      <div className="flex flex-col gap-3">
        <div>
          <p className="font-medium text-sm">
            Asset Destinations <span className="text-destructive">*</span>
          </p>
          <p className="text-muted-foreground text-sm">
            Choose where to send each asset and delivery date
          </p>
        </div>
        {selectedAssets.map((asset) => {
          const { displayName } = getAssetDisplayInfo(asset);
          const category = asset.category || "Computer";
          const origin = getOriginLabel(asset);
          const isExpanded = expandedAssetIds.has(asset._id);
          const detail = getPerAssetDetail(asset._id);
          const assetDestValue = getDestinationValue(detail.logisticsDestination);
          const intercountry = isAssetIntercountry(asset);
          const intercountryLabel = getIntercountryLabel(asset);

          return (
            <div
              key={asset._id}
              className={cn(
                "border rounded-lg bg-white overflow-hidden",
                intercountry ? "border-destructive" : "border-gray-200"
              )}
            >
              <button
                type="button"
                onClick={() => toggleAssetExpanded(asset._id)}
                className="flex justify-between items-center gap-3 w-full p-4 text-left hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex justify-center items-center w-10 h-10 rounded-lg bg-gray-100 shrink-0">
                    <Package className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="font-semibold text-sm text-gray-900">
                      {displayName} ({category})
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {asset.serialNumber && `${asset.serialNumber} • `}
                      {origin}
                    </span>
                  </div>
                  {intercountry && (
                    <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
                  )}
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                )}
              </button>
              {isExpanded && (
                <div className="px-4 pt-4 pb-4 flex flex-col gap-4 border-t border-gray-100">
                  <div className="gap-4 grid grid-cols-2">
                    {renderDestinationAndDelivery({
                      destinationValue: assetDestValue,
                      onDestinationChange: (v) =>
                        handleDestinationForAsset(asset._id, v),
                      deliveryDate: detail.desirableDeliveryDate,
                      onDeliveryDate: (s) =>
                        handleDeliveryDateForAsset(asset._id, s),
                      deliveryOpen: perAssetDeliveryOpen[asset._id] ?? false,
                      setDeliveryOpen: (v) =>
                        setPerAssetDeliveryOpen((prev) => ({
                          ...prev,
                          [asset._id]: v,
                        })),
                      showIntercountryAlert: intercountry,
                      intercountryLabel: intercountryLabel,
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sensitive Situation */}
      <div className="flex flex-col gap-4 p-4 border border-gray-200 rounded-lg bg-amber-50/30">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <p className="font-medium text-sm">Sensitive Situation</p>
        </div>
        <p className="text-muted-foreground text-sm">
          Let us know if this offboarding requires special handling
        </p>
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-sm">Is this a sensitive situation?</p>
              <p className="text-muted-foreground text-xs">
                e.g., termination, legal issues, etc.
              </p>
            </div>
            <Switch.Root
              checked={offboardingSensitiveSituation}
              onCheckedChange={(checked) =>
                onDataChange({ offboardingSensitiveSituation: checked })
              }
              className={cn(
                "relative flex-shrink-0 rounded-full w-10 h-6 transition-colors duration-200",
                offboardingSensitiveSituation ? "bg-blue" : "bg-gray-300"
              )}
            >
              <Switch.Thumb
                className={cn(
                  "block bg-white shadow-md rounded-full w-4 h-4 transform-gpu transition-transform duration-200",
                  offboardingSensitiveSituation ? "translate-x-5" : "translate-x-1"
                )}
              />
            </Switch.Root>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-sm">Does the employee know about this?</p>
              <p className="text-muted-foreground text-xs">
                Whether the employee is aware of their offboarding
              </p>
            </div>
            <Switch.Root
              checked={offboardingEmployeeAware}
              onCheckedChange={(checked) =>
                onDataChange({ offboardingEmployeeAware: checked })
              }
              className={cn(
                "relative flex-shrink-0 rounded-full w-10 h-6 transition-colors duration-200",
                offboardingEmployeeAware ? "bg-blue" : "bg-gray-300"
              )}
            >
              <Switch.Thumb
                className={cn(
                  "block bg-white shadow-md rounded-full w-4 h-4 transform-gpu transition-transform duration-200",
                  offboardingEmployeeAware ? "translate-x-5" : "translate-x-1"
                )}
              />
            </Switch.Root>
          </div>
        </div>
      </div>

      {/* Additional Comments */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="offboarding-additional-comments" className="text-sm font-medium">
          Additional Comments
        </Label>
        <textarea
          id="offboarding-additional-comments"
          placeholder="Any special instructions or requirements for this offboarding..."
          value={additionalComments || ""}
          onChange={(e) => onDataChange({ additionalComments: e.target.value })}
          rows={3}
          className="flex bg-background disabled:opacity-50 px-3 py-2 border border-input rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ring-offset-background min-h-[80px] placeholder:text-muted-foreground text-sm w-full"
        />
      </div>
    </div>
  );
};
