"use client";

import * as React from "react";
import { format, startOfToday } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Calendar } from "@/shared/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { Checkbox } from "@/shared";
import { Label } from "@/shared";
import { cn } from "@/shared";
import type { AsapOrDateValue } from "@/features/shipments/components/ShipmentWithFp/asap-or-date";

interface AsapOrDateQuotesProps {
  label: string;
  value: AsapOrDateValue;
  onChange: (value: AsapOrDateValue) => void;
  /** Id único para checkbox/label (evita que al hacer clic en una card se toque la de otra) */
  inputId?: string;
  /** Si es true, se muestra asterisco rojo (requerido) */
  required?: boolean;
  /** Ref del trigger (botón) para poder hacer focus desde pickup → delivery */
  inputRef?: React.Ref<HTMLButtonElement | null>;
  /** Llamado cuando el campo queda con valor (ASAP o fecha); usado en Pickup para pasar focus a Delivery */
  onFilled?: () => void;
  /** Control externo del popover (para abrir el calendario de Delivery al completar Pickup) */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Fechas adicionales a deshabilitar en el calendario (ej. delivery antes de pickup, pickup después de delivery) */
  disabledDate?: (date: Date) => boolean;
}

function toDateOnlyTimestamp(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/**
 * Variante para el flujo de Quotes/Logistics: cuando se elige ASAP no se muestra
 * el campo de fecha (solo checkbox). El formulario envía "ASAP" como valor.
 * Estilos alineados con el resto del formulario (Destination, etc.).
 */
export function AsapOrDateQuotes({
  label,
  value,
  onChange,
  inputId,
  required,
  inputRef,
  onFilled,
  open: openProp,
  onOpenChange: onOpenChangeProp,
  disabledDate,
}: AsapOrDateQuotesProps) {
  const isAsap = value === "ASAP";
  const selectedDate = value instanceof Date ? value : null;
  const id =
    inputId ??
    (label.replace(/\s+/g, "-").replace(/\*/g, "").toLowerCase() ||
      "asap-date");
  const labelText = label.replace(/\s*\*?\s*$/, "").trim();
  const [openInternal, setOpenInternal] = React.useState(false);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : openInternal;
  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setOpenInternal(next);
      onOpenChangeProp?.(next);
    },
    [isControlled, onOpenChangeProp]
  );
  const today = startOfToday();
  const popoverOpen = isControlled ? openProp : openInternal;
  const setPopoverOpen = setOpen;

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      onChange(date);
      onFilled?.();
      setOpen(false);
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    onChange(checked ? "ASAP" : "");
    if (checked) onFilled?.();
  };

  const disabledBeforeToday = (date: Date) =>
    toDateOnlyTimestamp(date) < toDateOnlyTimestamp(today);

  const isDateDisabled = (date: Date) =>
    disabledBeforeToday(date) || (disabledDate?.(date) ?? false);

  return (
    <div className="flex flex-col gap-2">
      <label className="block mb-0 font-medium text-sm">
        {labelText}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      <div className="flex justify-between items-center gap-4 min-h-10">
        <div className="flex flex-1 items-center gap-2 min-w-0">
          <Checkbox
            id={id}
            className="border-input shrink-0"
            checked={isAsap}
            onCheckedChange={handleCheckboxChange}
          />
          <Label
            htmlFor={id}
            className="font-medium text-foreground text-sm cursor-pointer"
          >
            ASAP
          </Label>
        </div>
        <div className="flex flex-1 items-center min-w-0">
          {!isAsap ? (
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  ref={inputRef}
                  variant="outline"
                  className={cn(
                    "justify-start w-full h-10 font-normal text-left",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 w-4 h-4" />
                  {selectedDate
                    ? format(selectedDate, "PPP")
                    : `Select ${labelText.toLowerCase()}`}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-auto" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate ?? undefined}
                  onSelect={handleCalendarSelect}
                  disabled={isDateDisabled}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          ) : (
            <span className="block w-full h-10" aria-hidden />
          )}
        </div>
      </div>
    </div>
  );
}
