import { useEffect, useState } from "react";
import { Widget } from "@/features/dashboard";

export const useSortedWidgets = (widgets: Widget[] | null) => {
  const [sortedWidgets, setSortedWidgets] = useState<string[]>([]);

  useEffect(() => {
    // Validación defensiva: asegurar que widgets sea un array válido
    if (widgets && Array.isArray(widgets)) {
      const sortedWidgets = widgets
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((widget) => widget.id);

      setSortedWidgets(sortedWidgets);
    } else {
      // Si widgets no es válido, usar array vacío
      setSortedWidgets([]);
    }
  }, [widgets]);

  return sortedWidgets;
};
