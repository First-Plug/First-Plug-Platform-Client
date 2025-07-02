"use client";

import { Checkbox } from "@/shared";
import { Label } from "@/shared";
import { format, isValid, parseISO } from "date-fns";

export type AsapOrDateValue = "ASAP" | Date | "";

interface AsapOrDateProps {
  label: string;
  value: AsapOrDateValue;
  onChange: (value: AsapOrDateValue) => void;
}

export const AsapOrDate = ({ label, value, onChange }: AsapOrDateProps) => {
  const isAsap = value === "ASAP";
  const selectedDate = value instanceof Date ? value : null;

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isoString = e.target.value;

    if (isoString === "") {
      onChange("");
      return;
    }
    const parsed = parseISO(isoString);

    if (isValid(parsed)) {
      onChange(parsed);
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    if (checked) {
      onChange("ASAP");
    } else {
      onChange("");
    }
  };

  const today = format(new Date(), "yyyy-MM-dd");

  return (
    <div className="flex flex-col">
      <h2 className="font-semibold text-black">{label}</h2>
      <div className="flex justify-between items-center gap-4">
        <div className="flex flex-1 items-center gap-2">
          <Checkbox
            id={label}
            className="border-black"
            checked={isAsap}
            onCheckedChange={handleCheckboxChange}
          />
          <Label htmlFor={label} className="font-medium text-lg">
            ASAP
          </Label>
        </div>

        <div className="flex-1">
          <input
            type="date"
            value={selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""}
            onChange={handleDateChange}
            min={today} // Establece la fecha mínima como hoy
            className="p-4 py-2 border rounded-xl focus:outline-none w-full h-14 font-sans text-black"
          />
        </div>
      </div>
    </div>
  );
};
