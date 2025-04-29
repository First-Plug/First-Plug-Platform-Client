"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
      <h2 className="font-bold text-lg">{label}</h2>
      <div className="flex justify-between items-center gap-4">
        <div className="flex items-center gap-2 flex-1">
          <Checkbox
            id={label}
            className="border-black"
            checked={isAsap}
            onCheckedChange={handleCheckboxChange}
          />
          <Label htmlFor={label} className="text-lg font-medium">
            ASAP
          </Label>
        </div>

        <div className="flex-1">
          <input
            type="date"
            value={selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""}
            onChange={handleDateChange}
            min={today} // Establece la fecha mínima como hoy
            className="w-full h-14 py-2 rounded-xl border text-black p-4 font-sans focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
};
