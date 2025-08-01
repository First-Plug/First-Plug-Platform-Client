import { EmptyCard, EmptyCardLayout } from "@/shared";
import { useDateFilterStore } from "../store/dateFilter.store";

export const EmptyActivity = function EmptyActivity() {
  const { selectedDates } = useDateFilterStore();

  // Verificar si las fechas son diferentes a las por defecto (Last 7 days)
  const defaultStart = new Date();
  defaultStart.setDate(defaultStart.getDate() - 6);
  defaultStart.setHours(0, 0, 0, 0);

  const defaultEnd = new Date();
  defaultEnd.setHours(23, 59, 59, 999);

  const hasCustomDateFilters =
    selectedDates.startDate.getTime() !== defaultStart.getTime() ||
    selectedDates.endDate.getTime() !== defaultEnd.getTime();

  return (
    <EmptyCardLayout>
      <EmptyCard
        type={hasCustomDateFilters ? "noResultsWithFilters" : "actionHistory"}
      />
    </EmptyCardLayout>
  );
};
