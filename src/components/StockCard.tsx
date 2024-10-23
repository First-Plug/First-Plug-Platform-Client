"use client";
import React, { useState } from "react";
import { DoughnutChart } from "@/common";
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
    <div className="flex p-2 justify-between w-full h-full  overflow-hidden ">
      <div className="flex flex-col justify-between items-start flex-1 min-w-[200px] h-full pr-16 ">
        {CATEGORIES.map((category) => {
          const isSelected = selectedCategory === category;
          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`p-1 text-md font-semibold rounded-md flex items-center gap-2 ${
                isSelected ? "bg-hoverBlue text-blue/80" : "bg-white text-black"
              } hover:bg-hoverBlue `}
            >
              <span
                className={`${
                  isSelected ? "text-black" : "text-black"
                } flex items-center`}
              >
                {React.createElement(
                  categoryToIconMap[category.toLowerCase()] || Other
                )}
              </span>
              {category}
            </button>
          );
        })}
      </div>

      <div className="flex-grow h-full w-full flex items-center justify-center gap-6  ">
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
