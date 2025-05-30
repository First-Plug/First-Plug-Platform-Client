import { useCallback } from "react";
import { updateDashboard } from "@/features/dashboard";

export const useSaveOrder = (containerRef: React.RefObject<HTMLDivElement>) => {
  const saveOrderToDatabase = useCallback(async () => {
    if (containerRef.current) {
      const newOrder = Array.from(
        containerRef.current.querySelectorAll("[data-swapy-item]")
      ).map((el, index) => ({
        id: el.getAttribute("data-swapy-item") || "",
        order: index,
      }));

      await updateDashboard(newOrder);
    }
  }, [containerRef]);

  return saveOrderToDatabase;
};
