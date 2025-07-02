import { useEffect, useState } from "react";
import { Widget } from "@/features/dashboard";

export const useSortedWidgets = (widgets: Widget[] | null) => {
  const [sortedWidgets, setSortedWidgets] = useState<string[]>([]);

  useEffect(() => {
    if (widgets) {
      const sortedWidgets = widgets
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((widget) => widget.id);

      setSortedWidgets(sortedWidgets);
    }
  }, [widgets]);

  return sortedWidgets;
};
