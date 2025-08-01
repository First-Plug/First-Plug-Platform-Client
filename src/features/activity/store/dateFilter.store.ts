import { create } from "zustand";
import { startOfDay, endOfDay, subDays } from "date-fns";

interface DateFilterState {
  selectedDates: {
    startDate: Date;
    endDate: Date;
  };
  setSelectedDates: (dates: { startDate: Date; endDate: Date }) => void;
  resetToDefault: () => void;
}

const defaultDates = {
  startDate: startOfDay(subDays(new Date(), 6)),
  endDate: endOfDay(new Date()),
};

export const useDateFilterStore = create<DateFilterState>((set) => ({
  selectedDates: defaultDates,
  setSelectedDates: (dates) => set({ selectedDates: dates }),
  resetToDefault: () => set({ selectedDates: defaultDates }),
}));
