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
  startDate: startOfDay(subDays(new Date(), 30)),
  endDate: endOfDay(new Date()),
};

export const useLogisticsDateFilterStore = create<DateFilterState>((set) => ({
  selectedDates: defaultDates,
  setSelectedDates: (dates) => set({ selectedDates: dates }),
  resetToDefault: () => set({ selectedDates: defaultDates }),
}));
