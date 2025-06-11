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
  ).sort((a, b) => {
    if (a === "other") return 1;
    if (b === "other") return -1;
    return a.localeCompare(b);
  });

  return (
    <div className="flex flex-wrap gap-4">
      {uniqueCategories.map((category) => {
        const IconComponent = categoryToIconMap[category] || Other;
        return (
          <div className="group relative" key={category}>
            <IconComponent />
            <span className="hidden group-hover:block -top-8 left-1/2 z-50 absolute bg-gray-800 mt-2 px-2 py-1 rounded-md text-white text-xs whitespace-nowrap -translate-x-1/2 transform">
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </span>
          </div>
        );
      })}
    </div>
  );
};
