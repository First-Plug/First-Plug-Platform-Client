"use client";

import * as React from "react";
import { Info } from "lucide-react";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";

interface ExtendedWarrantyInputProps {
  enabled: boolean;
  extraYears?: number;
  onEnabledChange: (enabled: boolean) => void;
  onExtraYearsChange: (years: number | undefined) => void;
}

export const ExtendedWarrantyInput: React.FC<ExtendedWarrantyInputProps> = ({
  enabled,
  extraYears,
  onEnabledChange,
  onExtraYearsChange,
}) => {
  const handleExtraYearsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      onExtraYearsChange(undefined);
    } else {
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue) && numValue >= 0) {
        onExtraYearsChange(numValue);
      }
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Checkbox
          id="extended-warranty"
          checked={enabled}
          onCheckedChange={(checked) => onEnabledChange(checked === true)}
        />
        <Label htmlFor="extended-warranty" className="font-medium text-sm">
          Extended Warranty
        </Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" className="cursor-help">
                <Info className="w-4 h-4 text-muted-foreground" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">
                Extended warranty provides additional coverage beyond the
                standard warranty period. Specify the number of extra years you
                need.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {enabled && (
        <div className="flex flex-col gap-2 ml-6">
          <Label
            htmlFor="extra-years"
            className="text-muted-foreground text-sm"
          >
            Extra years:
          </Label>
          <Input
            id="extra-years"
            type="number"
            min="0"
            value={extraYears ?? ""}
            onChange={handleExtraYearsChange}
            placeholder="1"
            className="w-32"
          />
        </div>
      )}
    </div>
  );
};
