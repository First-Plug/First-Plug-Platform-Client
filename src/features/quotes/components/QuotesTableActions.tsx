"use client";

import DateRangeDropdown from "./date-range-calendar/DateRangeCalendar";

export const QuotesTableActions = () => {
  return (
    <div className="flex justify-end">
      <DateRangeDropdown />
    </div>
  );
};
