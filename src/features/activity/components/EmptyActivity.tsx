import { EmptyCard, EmptyCardLayout } from "@/shared";
import { useSearchParams } from "next/navigation";

export const EmptyActivity = function EmptyActivity() {
  const searchParams = useSearchParams();
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  const hasDateFilters = startDate && endDate;

  return (
    <EmptyCardLayout>
      <EmptyCard
        type={hasDateFilters ? "noResultsWithFilters" : "actionHistory"}
      />
    </EmptyCardLayout>
  );
};
