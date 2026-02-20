import React from "react";
import {
  HeadSet,
  LapTop,
  Gift,
  MonitorIcon,
  Mouse,
  Other,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared";
import { Product } from "@/features/assets";

const categoryToIconMap = {
  audio: () => <HeadSet />,
  computer: () => <LapTop />,
  merchandising: () => <Gift />,
  monitor: () => <MonitorIcon />,
  peripherals: () => <Mouse />,
  other: () => <Other />,
};

const categoryToLabel: Record<string, string> = {
  audio: "Audio",
  computer: "Computer",
  merchandising: "Merchandising",
  monitor: "Monitor",
  peripherals: "Peripherals",
  other: "Other",
};

interface CategoryIconsProps {
  products: Product[];
}

export const CategoryIcons: React.FC<CategoryIconsProps> = ({ products }) => {
  const uniqueCategories = Array.from(
    new Set(products.map((product) => product.category?.toLowerCase() ?? "other"))
  );

  // Orden específico de categorías (de izquierda a derecha)
  const categoryOrder = [
    "computer",
    "monitor",
    "audio",
    "peripherals",
    "other",
    "merchandising",
  ] as const;

  // Filtrar solo las categorías que tienen productos
  const categoriesWithProducts = categoryOrder.filter((category) =>
    uniqueCategories.includes(category)
  );

  return (
    <div className="flex gap-2">
      {categoriesWithProducts.map((category) => {
        const IconComponent = categoryToIconMap[category] || Other;
        const label = categoryToLabel[category] || category.charAt(0).toUpperCase() + category.slice(1);
        return (
          <TooltipProvider key={category}>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <span className="inline-flex cursor-default">
                  <IconComponent />
                </span>
              </TooltipTrigger>
              <TooltipContent className="bg-blue/80 text-white text-xs">
                {label}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </div>
  );
};
