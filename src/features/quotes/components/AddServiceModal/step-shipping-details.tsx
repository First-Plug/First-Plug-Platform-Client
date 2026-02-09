"use client";

import * as React from "react";
import { format, startOfToday } from "date-fns";
import { CalendarIcon, Package } from "lucide-react";
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
import type { LogisticsDestination } from "@/features/quotes/types/quote.types";

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

interface StepShippingDetailsProps {
  assetIds: string[];
  logisticsDestination?: LogisticsDestination;
  desirablePickupDate?: string;
  desirableDeliveryDate?: string;
  additionalDetails?: string;
  onDataChange: (updates: {
    logisticsDestination?: LogisticsDestination;
    desirablePickupDate?: string;
    desirableDeliveryDate?: string;
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
  logisticsDestination,
  desirablePickupDate,
  desirableDeliveryDate,
  additionalDetails,
  onDataChange,
}) => {
  const { data: assetsData } = useGetTableAssets();
  const { data: membersData } = useFetchMembers();
  const { offices: officesData } = useOffices();

  const today = startOfToday();
  const [pickupCalendarOpen, setPickupCalendarOpen] = React.useState(false);
  const [deliveryCalendarOpen, setDeliveryCalendarOpen] = React.useState(false);

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

  const handleDestinationChange = (selectedValue: string) => {
    if (!selectedValue) {
      onDataChange({ logisticsDestination: undefined });
      return;
    }

    if (selectedValue === "FP warehouse") {
      onDataChange({
        logisticsDestination: {
          type: "Warehouse",
          // Sin warehouseId = destino genérico "FP warehouse" (countryCode por producto en el payload)
        },
      });
      return;
    }

    const [type, id] = selectedValue.split("_");

    if (type === "member") {
      const member = members.find((m) => (m as any)._id === id);
      if (member) {
        const m = member as any;
        onDataChange({
          logisticsDestination: {
            type: "Member",
            memberId: m._id || "",
            assignedMember: `${m.firstName || ""} ${m.lastName || ""}`.trim() || m.email,
            assignedEmail: m.email || "",
            countryCode: m.countryCode || m.country || "",
          },
        });
      }
    } else if (type === "office") {
      const office = offices.find((o) => o._id === id);
      if (office) {
        onDataChange({
          logisticsDestination: {
            type: "Office",
            officeId: office._id,
            officeName: office.name,
            countryCode: office.country || "",
          },
        });
      }
    }
  };

  const pickupDateValue = React.useMemo(() => {
    if (!desirablePickupDate) return undefined;
    const m = desirablePickupDate.match(/^(\d{4})[-\/](\d{2})[-\/](\d{2})/);
    if (!m) return undefined;
    const [, y, mo, d] = m;
    return new Date(parseInt(y), parseInt(mo) - 1, parseInt(d));
  }, [desirablePickupDate]);

  const deliveryDateValue = React.useMemo(() => {
    if (!desirableDeliveryDate) return undefined;
    const m = desirableDeliveryDate.match(/^(\d{4})[-\/](\d{2})[-\/](\d{2})/);
    if (!m) return undefined;
    const [, y, mo, d] = m;
    return new Date(parseInt(y), parseInt(mo) - 1, parseInt(d));
  }, [desirableDeliveryDate]);

  if (selectedAssets.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <p className="text-muted-foreground">No assets selected.</p>
      </div>
    );
  }

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

      {/* Assets to Ship */}
      <div className="flex flex-col gap-2">
        <Label className="font-medium text-sm">Assets to Ship</Label>
        <ul className="flex flex-col gap-1.5 list-none">
          {selectedAssets.map((asset) => {
            const { displayName } = getAssetDisplayInfo(asset);
            const location = getLocationLabel(asset);
            return (
              <li
                key={asset._id}
                className="flex justify-between items-center py-2 px-3 rounded-md bg-gray-50 border border-gray-100 text-sm"
              >
                <span className="font-medium text-black">{displayName}</span>
                <span className="text-muted-foreground">{location}</span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Destination * */}
      <div className="flex flex-col gap-2">
        <SelectDropdownOptions
          label="Destination"
          placeholder="Select destination"
          value={destinationValue}
          onChange={handleDestinationChange}
          options={directDestinationOptions}
          optionGroups={destinationOptionGroups}
          required
          compact={true}
        />
      </div>

      {/* Pickup Date * */}
      <div className="flex flex-col gap-2">
        <Label className="text-sm font-medium">
          Pickup Date <span className="text-destructive">*</span>
        </Label>
        <Popover open={pickupCalendarOpen} onOpenChange={setPickupCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !desirablePickupDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {desirablePickupDate
                ? format(pickupDateValue!, "PPP")
                : "Select pickup date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={pickupDateValue}
              onSelect={(date) => {
                if (date) {
                  onDataChange({
                    desirablePickupDate: format(date, "yyyy-MM-dd"),
                  });
                  setPickupCalendarOpen(false);
                }
              }}
              disabled={(date) => date < today}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Delivery Date * */}
      <div className="flex flex-col gap-2">
        <Label className="text-sm font-medium">
          Delivery Date <span className="text-destructive">*</span>
        </Label>
        <Popover open={deliveryCalendarOpen} onOpenChange={setDeliveryCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !desirableDeliveryDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {desirableDeliveryDate
                ? format(deliveryDateValue!, "PPP")
                : "Select delivery date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={deliveryDateValue}
              onSelect={(date) => {
                if (date) {
                  onDataChange({
                    desirableDeliveryDate: format(date, "yyyy-MM-dd"),
                  });
                  setDeliveryCalendarOpen(false);
                }
              }}
              disabled={(date) => date < today}
              initialFocus
            />
          </PopoverContent>
        </Popover>
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
