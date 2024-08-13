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
  ).sort();

  return (
    <div className="flex gap-2">
      {uniqueCategories.map((category) => {
        const IconComponent = categoryToIconMap[category] || GenericIcon;
        return <IconComponent key={category} />;
      })}
    </div>
  );
};

export default CategoryIcons;
