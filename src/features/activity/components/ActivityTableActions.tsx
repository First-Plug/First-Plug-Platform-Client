"use client";

import DateRangeDropdown from "./date-range-calendar/DateRangeCalendar";

export const ActivityTableActions = () => {
  return (
    <div className="flex justify-end mb-4">
      <DateRangeDropdown />
    </div>
  );
};
