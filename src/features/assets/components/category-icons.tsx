import React from "react";
import { HeadSet, LapTop, Gift, MonitorIcon, Mouse, Other } from "@/shared";
import { Product } from "@/features/assets";

const categoryToIconMap = {
  audio: () => <HeadSet />,
  computer: () => <LapTop />,
  merchandising: () => <Gift />,
  monitor: () => <MonitorIcon />,
  peripherals: () => <Mouse />,
  other: () => <Other />,
};

interface CategoryIconsProps {
  products: Product[];
}

export const CategoryIcons: React.FC<CategoryIconsProps> = ({ products }) => {
  const uniqueCategories = Array.from(
    new Set(products.map((product) => product.category.toLowerCase()))
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
      {categoriesWithProducts.map((category, index) => {
        const IconComponent = categoryToIconMap[category] || Other;
        const isLast = index === categoriesWithProducts.length - 1;
        return (
          <div className="group relative" key={category}>
            <IconComponent />
            <span
              className={`hidden group-hover:block -top-8 z-50 absolute bg-gray-800 mt-2 px-2 py-1 rounded-md text-white text-xs whitespace-nowrap ${
                isLast ? "right-0" : "left-1/2 -translate-x-1/2 transform"
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </span>
          </div>
        );
      })}
    </div>
  );
};
