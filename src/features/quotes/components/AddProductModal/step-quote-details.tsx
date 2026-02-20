"use client";

import * as React from "react";
import { format, startOfToday, isBefore, parse } from "date-fns";
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
  // Obtener la fecha de hoy en la zona horaria local (sin tiempo)
  const today = startOfToday();

  const [date, setDate] = React.useState<Date | undefined>(() => {
    if (!productData.requiredDeliveryDate) return undefined;

    // Parsear fecha en formato yyyy-mm-dd manualmente para evitar problemas de zona horaria
    const dateMatch = productData.requiredDeliveryDate.match(
      /^(\d{4})[-\/](\d{2})[-\/](\d{2})/
    );
    if (!dateMatch) return undefined;

    const [, year, month, day] = dateMatch;
    // Crear fecha en zona horaria local usando parse de date-fns
    return parse(`${year}-${month}-${day}`, "yyyy-MM-dd", new Date());
  });
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      // Guardar solo la fecha en formato YYYY-MM-DD (sin tiempo)
      const dateOnly = format(selectedDate, "yyyy-MM-dd");
      onDataChange({ requiredDeliveryDate: dateOnly });
      // Cerrar el calendario después de seleccionar
      setIsCalendarOpen(false);
    } else {
      onDataChange({ requiredDeliveryDate: undefined });
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="w-full text-muted-foreground text-left">
        Provide the delivery details and any additional details for your quote
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
          <Label htmlFor="city">City</Label>
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
            Required Delivery Date
          </Label>
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
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
                onSelect={handleDateSelect}
                disabled={(date) => isBefore(date, today)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Additional details */}
      <div className="flex flex-col gap-2 w-full">
        <Label htmlFor="additionalComments">
          Additional details
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
