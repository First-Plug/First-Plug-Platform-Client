"use client";
import React from "react";
import { HeadSet, LapTop, Gift, MonitorIcon, Mouse, Other } from "@/shared";
import { type ProductTable } from "@/features/assets";
import { CATEGORIES } from "@/features/assets/interfaces/product";
import { DoughnutChart, useProductStats } from "@/features/dashboard";

interface StockCardProps {
  products: ProductTable[];
}

const categoryToIconMap = {
  audio: HeadSet,
  computer: LapTop,
  merchandising: Gift,
  monitor: MonitorIcon,
  peripherals: Mouse,
  other: Other,
};

export function StockCard({ products }: StockCardProps) {
  const { selectedCategory, setSelectedCategory, categoryProducts, stats } =
    useProductStats(products);

  return (
    <div className="flex justify-between p-2 w-full h-full overflow-hidden">
      <div className="flex flex-col flex-1 justify-between items-start pr-16 min-w-[200px] h-full">
        {CATEGORIES.map((category) => {
          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`p-1 text-md font-semibold rounded-md flex items-center gap-2 ${
                selectedCategory === category
                  ? "bg-hoverBlue text-blue/80"
                  : "bg-white text-black"
              } hover:bg-hoverBlue `}
            >
              <span
                className={`${
                  selectedCategory === category ? "text-black" : "text-black"
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

      <div className="flex flex-grow justify-center items-center gap-6 w-full h-full">
        {categoryProducts.length > 0 ? (
          <DoughnutChart
            data={{
              stock: stats.available,
              quantity: stats.assigned,
              unavailable: stats.unavailable,
              inTransit: stats.inTransit,
              inTransitMissingData: stats.inTransitMissingData,
            }}
          />
        ) : (
          <p className="font-medium text-dark-grey text-center">
            No products for this category
          </p>
        )}
      </div>
    </div>
  );
}
