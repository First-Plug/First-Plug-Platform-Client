"use client";

import { useState, useEffect } from "react";
import { endOfDay, format, startOfDay, subDays } from "date-fns";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { useDateFilterStore } from "@/features/activity/store/dateFilter.store";

const predefinedRanges = [
  {
    label: "Last 7 days",
    value: "last7",
    range: [startOfDay(subDays(new Date(), 6)), endOfDay(new Date())],
  },
  {
    label: "Last 30 days",
    value: "last30",
    range: [startOfDay(subDays(new Date(), 30)), endOfDay(new Date())],
  },
  {
    label: "Last 90 days",
    value: "last90",
    range: [startOfDay(subDays(new Date(), 90)), endOfDay(new Date())],
  },
  { label: "Custom", value: "custom", range: [null, null] },
];

const DateRangeDropdown = () => {
  const { selectedDates, setSelectedDates } = useDateFilterStore();

  const [selectedOption, setSelectedOption] = useState(predefinedRanges[0]);
  const [open, setOpen] = useState(false);

  const [internalRange, setInternalRange] = useState<{
    startDate: Date;
    endDate: Date;
  }>({
    startDate: startOfDay(subDays(new Date(), 7)),
    endDate: endOfDay(new Date()),
  });

  // Inicializar el estado cuando se monta el componente
  useEffect(() => {
    // Sincronizar con las fechas actuales del store
    if (selectedDates.startDate && selectedDates.endDate) {
      const matchingOption = predefinedRanges.find((option) => {
        if (option.value === "custom") return false;

        const optionStart = startOfDay(option.range[0]);
        const optionEnd = endOfDay(option.range[1]);
        const selectedStart = startOfDay(selectedDates.startDate);
        const selectedEnd = endOfDay(selectedDates.endDate);

        return (
          optionStart.getTime() === selectedStart.getTime() &&
          optionEnd.getTime() === selectedEnd.getTime()
        );
      });

      if (matchingOption) {
        setSelectedOption(matchingOption);
      } else {
        setSelectedOption({
          label: `(${format(selectedDates.startDate, "dd MMM")} - ${format(
            selectedDates.endDate,
            "dd MMM"
          )})`,
          value: "custom",
          range: [selectedDates.startDate, selectedDates.endDate],
        });
      }
    } else {
      // If there are no dates in the store, initialize with "Last 7 days"
      const defaultOption = predefinedRanges[0];
      setSelectedOption(defaultOption);
      setSelectedDates({
        startDate: defaultOption.range[0],
        endDate: defaultOption.range[1],
      });
    }

    // Actualizar el rango interno para el calendario
    setInternalRange({
      startDate: selectedDates.startDate || startOfDay(subDays(new Date(), 7)),
      endDate: selectedDates.endDate || endOfDay(new Date()),
    });
  }, [selectedDates.startDate, selectedDates.endDate, setSelectedDates]);

  // Sincronizar cuando cambian las fechas
  useEffect(() => {
    if (selectedDates.startDate && selectedDates.endDate) {
      const matchingOption = predefinedRanges.find((option) => {
        if (option.value === "custom") return false;

        const optionStart = startOfDay(option.range[0]);
        const optionEnd = endOfDay(option.range[1]);
        const selectedStart = startOfDay(selectedDates.startDate);
        const selectedEnd = endOfDay(selectedDates.endDate);

        return (
          optionStart.getTime() === selectedStart.getTime() &&
          optionEnd.getTime() === selectedEnd.getTime()
        );
      });

      if (matchingOption) {
        setSelectedOption(matchingOption);
      } else {
        setSelectedOption({
          label: `(${format(selectedDates.startDate, "dd MMM")} - ${format(
            selectedDates.endDate,
            "dd MMM"
          )})`,
          value: "custom",
          range: [selectedDates.startDate, selectedDates.endDate],
        });
      }

      setInternalRange({
        startDate: selectedDates.startDate,
        endDate: selectedDates.endDate,
      });
    }
  }, [selectedDates.startDate, selectedDates.endDate]);

  const handleSelect = (value: string) => {
    const option = predefinedRanges.find((o) => o.value === value);
    if (option) {
      setSelectedOption(option);
      if (option.value === "custom") {
        setOpen(true);
      } else {
        setSelectedDates({
          startDate: startOfDay(option.range[0]),
          endDate: endOfDay(option.range[1]),
        });
        setOpen(false);
      }
    }
  };

  const handleDateChange = (range: any) => {
    if (selectedOption.value === "custom") {
      setInternalRange({
        startDate: range.selection.startDate,
        endDate: range.selection.endDate,
      });
    }
  };

  const handleAccept = () => {
    setSelectedOption({
      label: `(${format(internalRange.startDate, "dd MMM")} - ${format(
        internalRange.endDate,
        "dd MMM"
      )})`,
      value: "custom",
      range: [internalRange.startDate, internalRange.endDate],
    });
    setOpen(false);

    setSelectedDates({
      startDate: startOfDay(internalRange.startDate),
      endDate: endOfDay(internalRange.endDate),
    });
  };

  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const rightPosition = windowWidth < 768 ? 0 : 0;

  return (
    <div className="relative">
      <select
        className="flex items-center bg-white px-3 py-1 border rounded h-[32px] text-sm"
        onChange={(e) => handleSelect(e.target.value)}
        onClick={() => {
          if (selectedOption.value === "custom") {
            setOpen(true);
          }
        }}
        value={selectedOption.value}
      >
        {predefinedRanges.map((option) => (
          <option key={option.value} value={option.value} className="text-sm">
            {option.label}{" "}
            {option.value !== "custom" &&
              `(${format(option.range[0], "dd MMM")} - ${format(
                option.range[1],
                "dd MMM"
              )})`}
            {option.value === "custom" &&
            selectedOption.value === "custom" &&
            selectedDates.startDate &&
            selectedDates.endDate
              ? `(${format(selectedDates.startDate, "dd MMM yyyy")} - ${format(
                  selectedDates.endDate,
                  "dd MMM yyyy"
                )})`
              : ""}
          </option>
        ))}
      </select>

      {selectedOption.value === "custom" && open && (
        <div
          className="z-50 absolute bg-white shadow-lg p-4 w-auto"
          style={{
            top: "100%",
            right: rightPosition,
            marginTop: "4px",
          }}
        >
          <DateRange
            ranges={[
              {
                startDate: internalRange.startDate || new Date(),
                endDate: internalRange.endDate || endOfDay(new Date()),
                key: "selection",
              },
            ]}
            maxDate={new Date()}
            onChange={handleDateChange}
          />
          <div className="flex justify-start mt-2">
            <button
              onClick={handleAccept}
              className="bg-blue px-4 py-2 rounded text-white text-sm"
            >
              Accept
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangeDropdown;
