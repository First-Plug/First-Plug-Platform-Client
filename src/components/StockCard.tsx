"use client";
import React, { useEffect, useState } from "react";
import { Button, DoughnutChart } from "@/common";
import {
  HeadSet,
  LapTop,
  Gift,
  MonitorIcon,
  Mouse,
  Other,
} from "@/common/Icons";
import { observer } from "mobx-react-lite";
import { CATEGORIES } from "@/types";

interface StockCardProps {
  products: any[];
}

const categoryToIconMap = {
  audio: HeadSet,
  computer: LapTop,
  merchandising: Gift,
  monitor: MonitorIcon,
  peripherals: Mouse,
  other: Other,
};

export const StockCard = observer(function ({ products }: StockCardProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(
    CATEGORIES[0]
  );

  const categoryProducts = selectedCategory
    ? products
        .filter(
          (table) =>
            table.category.toLowerCase() === selectedCategory.toLowerCase()
        )
        .flatMap((table) => table.products)
        .filter((product) => !product.deleted)
    : [];

  const availableCount = categoryProducts.filter(
    (product) => product.status === "Available"
  ).length;

  const assignedCount = categoryProducts.length - availableCount;

  return (
    <div className="flex p-4 gap-4 justify-between w-full h-full">
      <div className="flex flex-col justify-start items-start w-full h-full overflow-y-auto">
        {CATEGORIES.map((category) => (
          <Button
            key={category}
            body={category}
            variant="text"
            icon={React.createElement(
              categoryToIconMap[category.toLowerCase()] || Other
            )}
            className={`p-2 text-sm rounded-md ${
              selectedCategory === category ? "bg-lightGrey text-black" : ""
            }`}
            onClick={() => setSelectedCategory(category)}
          />
        ))}
      </div>
      <div className="w-1/2 h-full flex items-center justify-center">
        {categoryProducts.length > 0 ? (
          <DoughnutChart
            data={{ stock: availableCount, quantity: assignedCount }}
          />
        ) : (
          <p className="text-center text-dark-grey font-medium">
            No products for this category
          </p>
        )}
      </div>
    </div>
  );
});
