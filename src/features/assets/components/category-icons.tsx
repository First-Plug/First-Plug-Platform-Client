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
      {categoriesWithProducts.map((category) => {
        const IconComponent = categoryToIconMap[category] || Other;
        return (
          <div key={category}>
            <IconComponent />
          </div>
        );
      })}
    </div>
  );
};
