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
import { useDateFilterStore } from "../../store/dateFilter.store";
import { useSearchParams } from "next/navigation";

const predefinedRanges = [
  {
    label: "Last 7 days",
    value: "last7",
    range: [subDays(new Date(), 6), new Date()],
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

const DateRangeDropdown = () => {
  const { selectedDates, setSelectedDates } = useDateFilterStore();
  const searchParams = useSearchParams();
  const activityId = searchParams.get("activityId");

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
    if (activityId) {
      // Si hay activityId, forzar "Last 7 days"
      setSelectedOption(predefinedRanges[0]);
      setSelectedDates({
        startDate: predefinedRanges[0].range[0],
        endDate: predefinedRanges[0].range[1],
      });
    } else {
      // Si no hay activityId, sincronizar con las fechas actuales del store
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
      }
    }

    // Actualizar el rango interno para el calendario
    setInternalRange({
      startDate: selectedDates.startDate,
      endDate: selectedDates.endDate,
    });
  }, [
    activityId,
    selectedDates.startDate,
    selectedDates.endDate,
    setSelectedDates,
  ]);

  // Sincronizar cuando cambian las fechas (solo cuando NO hay activityId)
  useEffect(() => {
    if (!activityId && selectedDates.startDate && selectedDates.endDate) {
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
  }, [selectedDates.startDate, selectedDates.endDate, activityId]);

  const handleSelect = (value: string) => {
    const option = predefinedRanges.find((o) => o.value === value);
    if (option) {
      setSelectedOption(option);
      if (option.value === "custom") {
        setOpen(true);
      } else {
        setSelectedDates({
          startDate: option.range[0],
          endDate: option.range[1],
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
    if (selectedDates.startDate && selectedDates.endDate) {
      setSelectedOption({
        label: `(${format(selectedDates.startDate, "dd MMM")} - ${format(
          selectedDates.endDate,
          "dd MMM"
        )})`,
        value: "custom",
        range: [selectedDates.startDate, selectedDates.endDate],
      });
      setOpen(false);

      setSelectedDates({
        startDate: internalRange.startDate,
        endDate: internalRange.endDate,
      });
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
        className="bg-white p-2 border rounded w-full text-sm"
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
          className="z-50 absolute bg-white shadow-lg p-4"
          style={{
            top: "100%",
            left: leftPosition,
            right: 0,
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
          <div className="flex justify-end mt-2">
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
