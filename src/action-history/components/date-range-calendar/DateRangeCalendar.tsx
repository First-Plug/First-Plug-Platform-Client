import { useState, useEffect } from "react";
import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from "date-fns";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

const predefinedRanges = [
  {
    label: "Last 7 days",
    value: "last7",
    range: [subDays(new Date(), 7), new Date()],
  },
  {
    label: "Last 30 days",
    value: "last30",
    range: [subDays(new Date(), 30), new Date()],
  },
  {
    label: "Last 90 days",
    value: "last90",
    range: [subDays(new Date(), 90), new Date()],
  },
  {
    label: "Last week",
    value: "lastWeek",
    range: [
      startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 }),
      endOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 }),
    ],
  },
  {
    label: "Last month",
    value: "lastMonth",
    range: [
      startOfMonth(subMonths(new Date(), 1)),
      endOfMonth(subMonths(new Date(), 1)),
    ],
  },
  { label: "Custom", value: "custom", range: [null, null] },
];

const DateRangeDropdown = ({ onDateSelect, selectedDates }: any) => {
  const [selectedOption, setSelectedOption] = useState(predefinedRanges[0]);
  const [customRange, setCustomRange] = useState<{
    startDate: Date | undefined;
    endDate: Date | undefined;
  }>({
    startDate: selectedDates?.startDate
      ? startOfDay(selectedDates.startDate)
      : undefined,
    endDate: selectedDates?.endDate
      ? endOfDay(selectedDates.endDate)
      : undefined,
  });

  const [open, setOpen] = useState(false);

  const handleSelect = (value: string) => {
    const option = predefinedRanges.find((o) => o.value === value);
    if (option) {
      setSelectedOption(option);
      if (option.value === "custom") {
        setCustomRange({
          startDate: undefined,
          endDate: undefined,
        });
        setOpen(true);
      } else {
        setCustomRange({
          startDate: option.range[0],
          endDate: option.range[1],
        });
        setOpen(false);
      }
    }
  };

  const handleDateChange = (range: any) => {
    setCustomRange({
      startDate: startOfDay(range.selection.startDate),
      endDate: endOfDay(range.selection.endDate),
    });
  };

  const handleAccept = () => {
    if (customRange.startDate && customRange.endDate) {
      setSelectedOption({
        label: `(${format(customRange.startDate, "dd MMM")} - ${format(
          customRange.endDate,
          "dd MMM"
        )})`,
        value: "custom",
        range: [customRange.startDate, customRange.endDate],
      });
      setOpen(false);
      onDateSelect(customRange);
    }
  };

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const leftPosition = windowWidth < 768 ? 0 : "-10rem";

  return (
    <div className="relative">
      <select
        className="border rounded p-2 w-full bg-white text-sm"
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
            customRange.startDate &&
            customRange.endDate
              ? `(${format(customRange.startDate, "dd MMM yyyy")} - ${format(
                  customRange.endDate,
                  "dd MMM yyyy"
                )})`
              : ""}
          </option>
        ))}
      </select>

      {selectedOption.value === "custom" && open && (
        <div
          className="absolute z-50 bg-white p-4 shadow-lg"
          style={{
            top: "100%",
            left: leftPosition,
            right: 0,
          }}
        >
          <DateRange
            ranges={[
              {
                startDate: customRange.startDate || new Date(),
                endDate: customRange.endDate || endOfDay(new Date()),
                key: "selection",
              },
            ]}
            maxDate={new Date()}
            onChange={handleDateChange}
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={handleAccept}
              className="bg-blue text-white px-4 py-2 rounded text-sm"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangeDropdown;
