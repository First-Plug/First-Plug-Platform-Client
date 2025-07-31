"use client";

import DateRangeDropdown from "./date-range-calendar/DateRangeCalendar";

interface ActivityTableActionsProps {
  selectedDates: { startDate: Date; endDate: Date };
  setSelectedDates: (dates: { startDate: Date; endDate: Date }) => void;
}

export const ActivityTableActions = ({
  selectedDates,
  setSelectedDates,
}: ActivityTableActionsProps) => {
  return (
    <div className="flex justify-end mb-4">
      <DateRangeDropdown
        setSelectedDates={setSelectedDates}
        selectedDates={selectedDates}
      />
    </div>
  );
};
