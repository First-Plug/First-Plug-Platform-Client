"use client";

import * as React from "react";
import { format, startOfToday } from "date-fns";
import { CalendarIcon, Package, ChevronDown, ChevronUp } from "lucide-react";
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
import type { LogisticsDestination, LogisticsDetailPerAsset } from "@/features/quotes/types/quote.types";

/** Parsea YYYY-MM-DD a Date a mediodía local (solo fecha, sin depender de hora) */
function parseDateOnly(str: string | undefined): Date | undefined {
  if (!str) return undefined;
  const m = str.match(/^(\d{4})[-\/](\d{2})[-\/](\d{2})/);
  if (!m) return undefined;
  const [, y, mo, d] = m;
  return new Date(parseInt(y), parseInt(mo) - 1, parseInt(d), 12, 0, 0);
}

/** Comparación solo por día (sin tiempo) */
function toDateOnlyTimestamp(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
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
    return String(
      product.assignedMember || product.assignedEmail || "Unassigned"
    );
  }
  if (product.location === "Our office") {
    return String(
      (product as any).office?.officeName || (product as any).officeName || "Our office"
    );
  }
  if (product.location === "FP warehouse") {
    return "FP warehouse";
  }
  return product.location || "";
};

/** "Origin: Buenos Aires Office • Argentina" */
const getOriginLabel = (product: Product): string => {
  const location = getLocationLabel(product);
  const countryCode =
    (product as any).office?.country ||
    (product as any).officeCountryCode ||
    product.countryCode ||
    (product as any).country ||
    "";
  const countryName = countryCode
    ? countriesByCode[countryCode] || countryCode
    : "";
  if (!countryName) return `Origin: ${location}`;
  return `Origin: ${location} • ${countryName}`;
};

interface StepShippingDetailsProps {
  assetIds: string[];
  sameDetailsForAllAssets?: boolean;
  logisticsDestination?: LogisticsDestination;
  desirablePickupDate?: string;
  desirableDeliveryDate?: string;
  logisticsDetailsPerAsset?: Record<string, LogisticsDetailPerAsset>;
  additionalDetails?: string;
  onDataChange: (updates: {
    sameDetailsForAllAssets?: boolean;
    logisticsDestination?: LogisticsDestination;
    desirablePickupDate?: string;
    desirableDeliveryDate?: string;
    logisticsDetailsPerAsset?: Record<string, LogisticsDetailPerAsset>;
    additionalDetails?: string;
  }) => void;
}

function getDestinationValue(dest: LogisticsDestination | undefined): string {
  if (!dest || !dest.type) return "";
  if (dest.type === "Office" && dest.officeId) return `office_${dest.officeId}`;
  if (dest.type === "Member" && dest.memberId) return `member_${dest.memberId}`;
  if (dest.type === "Warehouse") return "FP warehouse";
  return "";
}

export const StepShippingDetails: React.FC<StepShippingDetailsProps> = ({
  assetIds,
  sameDetailsForAllAssets = false,
  logisticsDestination,
  desirablePickupDate,
  desirableDeliveryDate,
  logisticsDetailsPerAsset,
  additionalDetails,
  onDataChange,
}) => {
  const { data: assetsData } = useGetTableAssets();
  const { data: membersData } = useFetchMembers();
  const { offices: officesData } = useOffices();

  const today = startOfToday();
  const [pickupCalendarOpen, setPickupCalendarOpen] = React.useState(false);
  const [deliveryCalendarOpen, setDeliveryCalendarOpen] = React.useState(false);
  const [expandedAssetIds, setExpandedAssetIds] = React.useState<Set<string>>(
    () => (assetIds?.length ? new Set([assetIds[0]]) : new Set())
  );
  const [perAssetPickupOpen, setPerAssetPickupOpen] = React.useState<Record<string, boolean>>({});
  const [perAssetDeliveryOpen, setPerAssetDeliveryOpen] = React.useState<Record<string, boolean>>({});

  const toggleAssetExpanded = (assetId: string) => {
    setExpandedAssetIds((prev) => {
      const next = new Set(prev);
      if (next.has(assetId)) next.delete(assetId);
      else next.add(assetId);
      return next;
    });
  };

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

  // Opción directa "FP warehouse" (siempre visible, como en Data Wipe)
  const directDestinationOptions = React.useMemo(
    () => ["FP warehouse"],
    []
  );

  const destinationOptionGroups = React.useMemo(() => {
    const groups: { label: string; options: { display: React.ReactNode; value: string }[] }[] = [];

    if (members.length > 0) {
      groups.push({
        label: "Members",
        options: members.map((m) => ({
          display: `${(m as any).firstName || ""} ${(m as any).lastName || ""}`.trim() || (m as any).email,
          value: `member_${(m as any)._id}`,
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

  const destinationValue = getDestinationValue(logisticsDestination);

  const parseDestinationFromValue = (selectedValue: string): LogisticsDestination | undefined => {
    if (!selectedValue) return undefined;
    if (selectedValue === "FP warehouse") return { type: "Warehouse" };
    const [type, id] = selectedValue.split("_");
    if (type === "member") {
      const member = members.find((m) => (m as any)._id === id);
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

  const getPerAssetDetail = (assetId: string): LogisticsDetailPerAsset =>
    logisticsDetailsPerAsset?.[assetId] || {};

  const handleDestinationChangeForAsset = (assetId: string, selectedValue: string) => {
    const dest = parseDestinationFromValue(selectedValue);
    onDataChange({
      logisticsDetailsPerAsset: {
        ...logisticsDetailsPerAsset,
        [assetId]: { ...getPerAssetDetail(assetId), logisticsDestination: dest },
      },
    });
  };

  const handlePickupDateForAsset = (assetId: string, dateStr: string | undefined) => {
    onDataChange({
      logisticsDetailsPerAsset: {
        ...logisticsDetailsPerAsset,
        [assetId]: { ...getPerAssetDetail(assetId), desirablePickupDate: dateStr },
      },
    });
  };

  const handleDeliveryDateForAsset = (assetId: string, dateStr: string | undefined) => {
    onDataChange({
      logisticsDetailsPerAsset: {
        ...logisticsDetailsPerAsset,
        [assetId]: { ...getPerAssetDetail(assetId), desirableDeliveryDate: dateStr },
      },
    });
  };

  const handleDestinationChange = (selectedValue: string) => {
    const dest = parseDestinationFromValue(selectedValue);
    onDataChange({
      logisticsDestination: dest,
      ...(sameDetailsForAllAssets &&
        assetIds.length > 0 && {
          logisticsDetailsPerAsset: assetIds.reduce(
            (acc, id) => ({
              ...acc,
              [id]: { ...getPerAssetDetail(id), logisticsDestination: dest },
            }),
            {} as Record<string, LogisticsDetailPerAsset>
          ),
        }),
    });
  };

  const handleGlobalPickupDate = (dateStr: string) => {
    onDataChange({
      desirablePickupDate: dateStr,
      ...(sameDetailsForAllAssets &&
        assetIds.length > 0 && {
          logisticsDetailsPerAsset: assetIds.reduce(
            (acc, id) => ({
              ...acc,
              [id]: { ...getPerAssetDetail(id), desirablePickupDate: dateStr },
            }),
            {} as Record<string, LogisticsDetailPerAsset>
          ),
        }),
    });
  };

  const handleGlobalDeliveryDate = (dateStr: string) => {
    onDataChange({
      desirableDeliveryDate: dateStr,
      ...(sameDetailsForAllAssets &&
        assetIds.length > 0 && {
          logisticsDetailsPerAsset: assetIds.reduce(
            (acc, id) => ({
              ...acc,
              [id]: { ...getPerAssetDetail(id), desirableDeliveryDate: dateStr },
            }),
            {} as Record<string, LogisticsDetailPerAsset>
          ),
        }),
    });
  };

  const pickupDateValue = React.useMemo(
    () => parseDateOnly(desirablePickupDate),
    [desirablePickupDate]
  );

  const deliveryDateValue = React.useMemo(
    () => parseDateOnly(desirableDeliveryDate),
    [desirableDeliveryDate]
  );

  if (selectedAssets.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <p className="text-muted-foreground">No assets selected.</p>
      </div>
    );
  }

  const renderDestinationAndDates = (opts: {
    destinationValue: string;
    onDestinationChange: (v: string) => void;
    pickupDate?: string;
    deliveryDate?: string;
    onPickupDate: (dateStr: string) => void;
    onDeliveryDate: (dateStr: string) => void;
    pickupOpen: boolean;
    deliveryOpen: boolean;
    setPickupOpen: (v: boolean) => void;
    setDeliveryOpen: (v: boolean) => void;
    disabled?: boolean;
    /** false en el bloque "Same details" (solo sirve para cargar las cards, no es requerido) */
    showRequired?: boolean;
  }) => {
    const showRequired = opts.showRequired !== false;
    const pickupVal = parseDateOnly(opts.pickupDate);
    const deliveryVal = parseDateOnly(opts.deliveryDate);

    const pickupDisabled = (date: Date) => {
      const d = toDateOnlyTimestamp(date);
      if (d < toDateOnlyTimestamp(today)) return true;
      if (deliveryVal && d >= toDateOnlyTimestamp(deliveryVal)) return true;
      return false;
    };
    const deliveryDisabled = (date: Date) => {
      const d = toDateOnlyTimestamp(date);
      if (d < toDateOnlyTimestamp(today)) return true;
      if (pickupVal && d <= toDateOnlyTimestamp(pickupVal)) return true;
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
            options={directDestinationOptions}
            optionGroups={destinationOptionGroups}
            required={showRequired}
            compact={true}
            quotesFormStyle
            disabled={opts.disabled}
          />
        </div>
        <div className="gap-4 grid grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium">
              Pickup Date {showRequired && <span className="text-destructive">*</span>}
            </Label>
            <Popover open={opts.pickupOpen} onOpenChange={opts.setPickupOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  disabled={opts.disabled}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !opts.pickupDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {opts.pickupDate
                    ? format(pickupVal!, "PPP")
                    : "Select pickup date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={pickupVal}
                  onSelect={(date) => {
                    if (date) {
                      opts.onPickupDate(format(date, "yyyy-MM-dd"));
                      if (deliveryVal && toDateOnlyTimestamp(date) >= toDateOnlyTimestamp(deliveryVal)) {
                        opts.onDeliveryDate("");
                      }
                      opts.setPickupOpen(false);
                    }
                  }}
                  disabled={pickupDisabled}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium">
              Delivery Date {showRequired && <span className="text-destructive">*</span>}
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
        </div>
      </>
    );
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Shipping Details card */}
      <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg bg-gray-50/50">
        <div className="flex justify-center items-center bg-blue/10 border border-blue/20 rounded-full w-10 h-10 shrink-0">
          <Package className="w-5 h-5 text-blue" />
        </div>
        <div>
          <p className="font-medium text-black">Shipping Details</p>
          <p className="text-muted-foreground text-sm">
            Configure shipping for {selectedAssets.length} asset{selectedAssets.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Same details for all assets */}
      <div className="flex justify-between items-start gap-4 bg-white p-4 border border-gray-200 rounded-lg">
        <div>
          <p className="font-medium text-sm">Same details for all assets</p>
          <p className="text-muted-foreground text-sm">
            Apply the same destination and dates to all selected assets
          </p>
        </div>
        <Switch.Root
          checked={sameDetailsForAllAssets}
          onCheckedChange={(checked) => {
            if (checked && assetIds.length > 0) {
              // Al activar "Same details": copiar primer asset a todos (solo sirve para cargar las cards, no es requerido)
              const first = getPerAssetDetail(assetIds[0]);
              const next: Record<string, LogisticsDetailPerAsset> = {};
              assetIds.forEach((id) => {
                next[id] = {
                  ...getPerAssetDetail(id),
                  logisticsDestination: first.logisticsDestination,
                  desirablePickupDate: first.desirablePickupDate,
                  desirableDeliveryDate: first.desirableDeliveryDate,
                };
              });
              onDataChange({
                sameDetailsForAllAssets: true,
                logisticsDetailsPerAsset: next,
                logisticsDestination: first.logisticsDestination,
                desirablePickupDate: first.desirablePickupDate,
                desirableDeliveryDate: first.desirableDeliveryDate,
              });
            } else {
              onDataChange({ sameDetailsForAllAssets: checked });
            }
          }}
          className={cn(
            "relative flex-shrink-0 rounded-full w-10 h-6 transition-colors duration-200",
            sameDetailsForAllAssets ? "bg-blue" : "bg-gray-300"
          )}
        >
          <Switch.Thumb
            className={cn(
              "block bg-white shadow-md rounded-full w-4 h-4 transform-gpu transition-transform duration-200",
              sameDetailsForAllAssets ? "translate-x-5" : "translate-x-1"
            )}
          />
        </Switch.Root>
      </div>

      {sameDetailsForAllAssets && (
        <div className="flex flex-col gap-4 p-4 border border-gray-200 rounded-lg bg-white">
          {renderDestinationAndDates({
            destinationValue,
            onDestinationChange: handleDestinationChange,
            pickupDate: desirablePickupDate,
            deliveryDate: desirableDeliveryDate,
            onPickupDate: handleGlobalPickupDate,
            onDeliveryDate: handleGlobalDeliveryDate,
            pickupOpen: pickupCalendarOpen,
            deliveryOpen: deliveryCalendarOpen,
            setPickupOpen: setPickupCalendarOpen,
            setDeliveryOpen: setDeliveryCalendarOpen,
            showRequired: false,
          })}
        </div>
      )}

      {/* Per-asset cards (collapsible) */}
      <div className="flex flex-col gap-3">
        {selectedAssets.map((asset) => {
          const { displayName } = getAssetDisplayInfo(asset);
          const category = asset.category || "Computer";
          const origin = getOriginLabel(asset);
          const isExpanded = expandedAssetIds.has(asset._id);
          const detail = getPerAssetDetail(asset._id);
          const assetDestValue = getDestinationValue(detail.logisticsDestination);
          const isConfigured =
            !!detail.logisticsDestination &&
            !!detail.desirablePickupDate &&
            !!detail.desirableDeliveryDate;
          return (
            <div
              key={asset._id}
              className="border border-gray-200 rounded-lg bg-white overflow-hidden"
            >
              <button
                type="button"
                onClick={() => toggleAssetExpanded(asset._id)}
                className="flex justify-between items-center w-full p-4 text-left hover:bg-gray-50/50 transition-colors"
              >
                <div>
                  <p className="font-semibold text-sm flex items-center gap-2 flex-wrap">
                    <span>
                      {displayName} ({category})
                    </span>
                    {isConfigured && (
                      <span className="text-blue text-xs font-medium">
                        Configured
                      </span>
                    )}
                  </p>
                  <p className="text-muted-foreground text-sm mt-0.5">{origin}</p>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-500 shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500 shrink-0" />
                )}
              </button>
              {isExpanded && (
                <div className="px-4 pt-4 pb-4 flex flex-col gap-4 border-t border-gray-100">
                  {sameDetailsForAllAssets ? (
                    <p className="text-muted-foreground text-sm">
                      Using same destination and dates for all assets. Edit in &quot;Same details for all assets&quot; above.
                    </p>
                  ) : (
                    renderDestinationAndDates({
                      destinationValue: assetDestValue,
                      onDestinationChange: (v) =>
                        handleDestinationChangeForAsset(asset._id, v),
                      pickupDate: detail.desirablePickupDate,
                      deliveryDate: detail.desirableDeliveryDate,
                      onPickupDate: (s) => handlePickupDateForAsset(asset._id, s),
                      onDeliveryDate: (s) =>
                        handleDeliveryDateForAsset(asset._id, s),
                      pickupOpen: perAssetPickupOpen[asset._id] ?? false,
                      deliveryOpen: perAssetDeliveryOpen[asset._id] ?? false,
                      setPickupOpen: (v) =>
                        setPerAssetPickupOpen((prev) => ({
                          ...prev,
                          [asset._id]: v,
                        })),
                      setDeliveryOpen: (v) =>
                        setPerAssetDeliveryOpen((prev) => ({
                          ...prev,
                          [asset._id]: v,
                        })),
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Additional Comments (optional) */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="shipping-additional-comments" className="text-sm font-medium">
          Additional Comments
        </Label>
        <textarea
          id="shipping-additional-comments"
          placeholder="Any special instructions or requirements..."
          value={additionalDetails || ""}
          onChange={(e) => onDataChange({ additionalDetails: e.target.value })}
          rows={3}
          className="flex bg-background disabled:opacity-50 px-3 py-2 border border-input rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ring-offset-background min-h-[80px] placeholder:text-muted-foreground text-sm w-full"
        />
      </div>
    </div>
  );
};
