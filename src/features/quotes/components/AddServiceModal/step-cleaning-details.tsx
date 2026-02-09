"use client";

import * as React from "react";
import { format, startOfToday } from "date-fns";
import { CalendarIcon, Sparkles } from "lucide-react";
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
import { Badge } from "@/shared";

interface StepCleaningDetailsProps {
  assetIds: string[];
  requiredDeliveryDate?: string;
  cleaningType?: "Superficial" | "Deep";
  additionalDetails?: string;
  onDataChange: (updates: {
    requiredDeliveryDate?: string;
    cleaningType?: "Superficial" | "Deep";
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

export const StepCleaningDetails: React.FC<StepCleaningDetailsProps> = ({
  assetIds,
  requiredDeliveryDate,
  cleaningType = "Deep",
  additionalDetails,
  onDataChange,
}) => {
  const { data: assetsData } = useGetTableAssets();
  const today = startOfToday();
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);

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

  const dateValue = React.useMemo(() => {
    if (!requiredDeliveryDate) return undefined;
    const dateMatch = requiredDeliveryDate.match(
      /^(\d{4})[-\/](\d{2})[-\/](\d{2})/
    );
    if (!dateMatch) return undefined;
    const [, year, month, day] = dateMatch;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }, [requiredDeliveryDate]);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      onDataChange({
        requiredDeliveryDate: format(selectedDate, "yyyy-MM-dd"),
      });
      setIsCalendarOpen(false);
    } else {
      onDataChange({ requiredDeliveryDate: undefined });
    }
  };

  const isDeepCleaning = cleaningType === "Deep";

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Assets to clean */}
      {selectedAssets.length > 0 && (
        <div className="flex flex-col gap-2">
          <Label className="font-medium text-sm">
            Assets to clean ({selectedAssets.length})
          </Label>
          <div className="flex flex-wrap gap-2">
            {selectedAssets.map((asset) => {
              const { displayName } = getAssetDisplayInfo(asset);
              return (
                <Badge
                  key={asset._id}
                  variant="secondary"
                  className="bg-gray-100 px-3 py-1.5 border border-gray-200 text-gray-800 text-sm"
                >
                  {displayName} ({asset.category})
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* When do you need this by? */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="cleaning-date" className="font-medium text-sm">
          When do you need this by?
        </Label>
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              id="cleaning-date"
              variant="outline"
              className={cn(
                "justify-start w-full max-w-xs font-normal text-sm text-left",
                !dateValue && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 w-4 h-4" />
              {dateValue ? format(dateValue, "dd/MM/yyyy") : "Select a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="bg-white p-0 w-auto" align="start">
            <Calendar
              mode="single"
              selected={dateValue}
              onSelect={handleDateSelect}
              disabled={(date) => date < today}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Type of cleaning - toggle OFF = Surface, ON = Deep */}
      <div className="flex flex-col gap-3">
        <Label className="font-medium text-sm">Type of cleaning</Label>
        <div className="flex flex-col gap-2 bg-white p-4 border border-gray-200 rounded-lg">
          <div className="flex justify-between items-start gap-4">
            <div className="flex items-start gap-3">
              <div className="flex flex-shrink-0 justify-center items-center bg-blue/10 border border-blue/20 rounded-full w-10 h-10">
                <Sparkles className="w-5 h-5 text-blue" strokeWidth={2} />
              </div>
              <div>
                <span className="block font-semibold text-sm">
                  {isDeepCleaning ? "Deep cleaning" : "Surface cleaning"}
                </span>
                <span className="text-muted-foreground text-sm">
                  {isDeepCleaning
                    ? "Thorough internal and external cleaning"
                    : "Basic external cleaning only"}
                </span>
              </div>
            </div>
            <Switch.Root
              checked={isDeepCleaning}
              onCheckedChange={(checked) => {
                onDataChange({
                  cleaningType: checked ? "Deep" : "Superficial",
                });
              }}
              className={cn(
                "relative flex-shrink-0 rounded-full w-10 h-6 transition-colors duration-200",
                isDeepCleaning ? "bg-blue" : "bg-gray-300"
              )}
            >
              <Switch.Thumb
                className={cn(
                  "block bg-white shadow-md rounded-full w-4 h-4 transform-gpu transition-transform duration-200",
                  isDeepCleaning ? "translate-x-5" : "translate-x-1"
                )}
              />
            </Switch.Root>
          </div>
        </div>
        <p className="text-muted-foreground text-xs">
          Toggle off for surface cleaning, toggle on for deep cleaning (default)
        </p>
      </div>

      {/* Additional details */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="cleaning-details" className="font-medium text-sm">
          Additional details
        </Label>
        <textarea
          id="cleaning-details"
          placeholder="Any specific cleaning requirements or notes..."
          value={additionalDetails || ""}
          onChange={(e) =>
            onDataChange({ additionalDetails: e.target.value || undefined })
          }
          rows={4}
          className="flex bg-background disabled:opacity-50 px-3 py-2 border border-input rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ring-offset-background focus-visible:ring-offset-2 w-full min-h-[80px] placeholder:text-muted-foreground text-sm disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );
};
