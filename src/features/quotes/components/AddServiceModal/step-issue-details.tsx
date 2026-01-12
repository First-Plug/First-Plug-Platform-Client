"use client";

import * as React from "react";
import { format, startOfToday, isBefore } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Label } from "@/shared/components/ui/label";
import { Button } from "@/shared/components/ui/button";
import { Calendar } from "@/shared/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { cn } from "@/shared";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";

interface StepIssueDetailsProps {
  description: string;
  issueStartDate?: string;
  impactLevel?: string;
  onDataChange: (updates: {
    description?: string;
    issueStartDate?: string;
    impactLevel?: string;
  }) => void;
}

export const StepIssueDetails: React.FC<StepIssueDetailsProps> = ({
  description,
  issueStartDate,
  impactLevel,
  onDataChange,
}) => {
  const today = startOfToday();

  const [date, setDate] = React.useState<Date | undefined>(() => {
    if (!issueStartDate) return undefined;

    // Parsear fecha en formato yyyy-mm-dd manualmente
    const dateMatch = issueStartDate.match(/^(\d{4})[-\/](\d{2})[-\/](\d{2})/);
    if (!dateMatch) return undefined;

    const [, year, month, day] = dateMatch;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  });
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      // Guardar solo la fecha en formato YYYY-MM-DD (sin tiempo)
      const dateOnly = format(selectedDate, "yyyy-MM-dd");
      onDataChange({ issueStartDate: dateOnly });
      // Cerrar el calendario después de seleccionar
      setIsCalendarOpen(false);
    } else {
      onDataChange({ issueStartDate: undefined });
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Description */}
      <div className="flex flex-col gap-2">
        <p className="text-muted-foreground">
          Provide more details about the issue
        </p>
        <Label htmlFor="description">
          Description<span className="ml-1 text-red-500">*</span>
        </Label>
        <textarea
          id="description"
          placeholder="Please describe the issue in detail..."
          value={description || ""}
          onChange={(e) => onDataChange({ description: e.target.value })}
          rows={6}
          className="flex bg-background disabled:opacity-50 px-3 py-2 border border-input rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ring-offset-background focus-visible:ring-offset-2 w-full min-h-[120px] placeholder:text-muted-foreground text-sm disabled:cursor-not-allowed"
          required
        />
      </div>

      {/* When did the issue start? */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="issue-start-date">
          When did the issue start? (Optional)
        </Label>
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              id="issue-start-date"
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

      {/* Impact Level */}
      <div className="flex flex-col gap-3">
        <Label>Impact Level</Label>
        <RadioGroup
          value={impactLevel || "medium"}
          onValueChange={(value) => onDataChange({ impactLevel: value })}
        >
          <div
            className={cn(
              "flex items-center gap-3 bg-white p-4 border-2 rounded-lg transition-all cursor-pointer",
              impactLevel === "low" && "border-primary"
            )}
            onClick={() => onDataChange({ impactLevel: "low" })}
          >
            <RadioGroupItem value="low" id="low" />
            <Label htmlFor="low" className="flex-1 font-normal cursor-pointer">
              Low - Minor inconvenience
            </Label>
          </div>
          <div
            className={cn(
              "flex items-center gap-3 bg-white p-4 border-2 rounded-lg transition-all cursor-pointer",
              impactLevel === "medium" && "border-primary"
            )}
            onClick={() => onDataChange({ impactLevel: "medium" })}
          >
            <RadioGroupItem value="medium" id="medium" />
            <Label
              htmlFor="medium"
              className="flex-1 font-normal cursor-pointer"
            >
              Medium - Affects productivity
            </Label>
          </div>
          <div
            className={cn(
              "flex items-center gap-3 bg-white p-4 border-2 rounded-lg transition-all cursor-pointer",
              impactLevel === "high" && "border-primary"
            )}
            onClick={() => onDataChange({ impactLevel: "high" })}
          >
            <RadioGroupItem value="high" id="high" />
            <Label htmlFor="high" className="flex-1 font-normal cursor-pointer">
              High - Cannot work
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Attachments (Optional) - Placeholder para futuro */}
      {/* TODO: Implementar funcionalidad de attachments más adelante
      <div className="flex flex-col gap-2">
        <Label>Attachments (Optional)</Label>
        <p className="text-muted-foreground text-sm">
          Upload photos or videos to help us understand the issue
        </p>
        <div className="flex justify-center items-center bg-gray-50 p-8 border-2 border-gray-300 border-dashed rounded-lg">
          <div className="flex flex-col items-center gap-2">
            <div className="text-gray-400">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <span className="text-gray-600 text-sm">Upload</span>
          </div>
        </div>
      </div>
      */}
    </div>
  );
};
