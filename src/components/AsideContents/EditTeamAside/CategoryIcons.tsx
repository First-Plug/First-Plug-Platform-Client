import React from "react";
import {
  HeadsetIcon,
  ComputerIcon,
  ShopBag,
  MonitorIcon,
  MouseIcon,
  GenericIcon,
} from "../../../common/Icons";
import { Product } from "@/types";

const categoryToIconMap = {
  audio: HeadsetIcon,
  computer: ComputerIcon,
  merchandising: ShopBag,
  monitor: MonitorIcon,
  peripherals: MouseIcon,
  other: GenericIcon,
};

interface CategoryIconsProps {
  products: Product[];
}

const CategoryIcons: React.FC<CategoryIconsProps> = ({ products }) => {
  const uniqueCategories = Array.from(
    new Set(products.map((product) => product.category.toLowerCase()))
  ).sort((a, b) => {
    if (a === "other") return 1;
    if (b === "other") return -1;
    return a.localeCompare(b);
  });

  return (
    <div className="flex gap-4 flex-wrap">
      {uniqueCategories.map((category) => {
        const IconComponent = categoryToIconMap[category] || GenericIcon;
        return (
          <div className="relative group" key={category}>
            <IconComponent />
            <span className="absolute left-1/2 transform -translate-x-1/2 -top-8 mt-2 hidden group-hover:block text-xs bg-gray-800 text-white rounded-md px-2 py-1 z-50 whitespace-nowrap">
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default CategoryIcons;
