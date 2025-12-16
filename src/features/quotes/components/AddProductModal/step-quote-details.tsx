"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { COUNTRIES } from "@/shared/constants/countries";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Calendar } from "@/shared/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { cn } from "@/shared";
import type { QuoteProduct } from "../../types/quote.types";

interface StepQuoteDetailsProps {
  productData: Partial<QuoteProduct>;
  onDataChange: (updates: Partial<QuoteProduct>) => void;
}

export const StepQuoteDetails: React.FC<StepQuoteDetailsProps> = ({
  productData,
  onDataChange,
}) => {
  const [date, setDate] = React.useState<Date | undefined>(
    productData.requiredDeliveryDate
      ? new Date(productData.requiredDeliveryDate)
      : undefined
  );

  React.useEffect(() => {
    if (date) {
      onDataChange({ requiredDeliveryDate: date.toISOString() });
    }
  }, [date, onDataChange]);

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="w-full text-muted-foreground text-center">
        Provide the delivery details and any additional comments for your quote
        request.
      </p>

      <div className="gap-4 grid grid-cols-2 w-full">
        {/* Country */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="country">
            Country<span className="ml-1 text-red-500">*</span>
          </Label>
          <Select
            value={productData.country || ""}
            onValueChange={(value) => onDataChange({ country: value })}
            required
          >
            <SelectTrigger id="country">
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* City */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="city">City (optional)</Label>
          <Input
            id="city"
            type="text"
            placeholder="Enter city"
            value={productData.city || ""}
            onChange={(e) => onDataChange({ city: e.target.value })}
          />
        </div>

        {/* Required Delivery Date */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="delivery-date">
            Required Delivery Date (optional)
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="delivery-date"
                variant="outline"
                className={cn(
                  "justify-start w-full font-normal text-left",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 w-4 h-4" />
                {date ? format(date, "dd/MM/yyyy") : <span>dd/mm/yyyy</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="bg-white p-0 w-auto" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Additional Comments */}
      <div className="flex flex-col gap-2 w-full">
        <Label htmlFor="additionalComments">
          Additional Comments (optional)
        </Label>
        <textarea
          id="additionalComments"
          placeholder="Any additional requirements, payment method preferences, or special instructions..."
          value={productData.additionalComments || ""}
          onChange={(e) => onDataChange({ additionalComments: e.target.value })}
          rows={4}
          className="flex bg-background disabled:opacity-50 px-3 py-2 border border-input rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ring-offset-background focus-visible:ring-offset-2 w-full min-h-[80px] placeholder:text-muted-foreground text-sm disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );
};
