"use client";

import * as React from "react";
import * as Icons from "@/shared/icons/icons";
import { Smartphone, Tablet, Sofa, Package } from "lucide-react";
import { cn } from "@/shared";

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  enabled: boolean;
}

const categories: Category[] = [
  {
    id: "computer",
    name: "Computer",
    icon: <Icons.LapTop />,
    enabled: true,
  },
  {
    id: "monitor",
    name: "Monitor",
    icon: <Icons.MonitorIcon />,
    enabled: true,
  },
  {
    id: "audio",
    name: "Audio",
    icon: <Icons.HeadSet />,
    enabled: false,
  },
  {
    id: "peripherals",
    name: "Peripherals",
    icon: <Icons.Mouse />,
    enabled: false,
  },
  {
    id: "merchandising",
    name: "Merchandising",
    icon: <Icons.Gift />,
    enabled: false,
  },
  {
    id: "phone",
    name: "Phone",
    icon: <Smartphone className="w-6 h-6" />,
    enabled: false,
  },
  {
    id: "furniture",
    name: "Furniture",
    icon: <Sofa className="w-6 h-6" />,
    enabled: false,
  },
  {
    id: "tablet",
    name: "Tablet",
    icon: <Tablet className="w-6 h-6" />,
    enabled: false,
  },
  {
    id: "other",
    name: "Other",
    icon: <Package className="w-6 h-6" />,
    enabled: false,
  },
];

interface StepCategorySelectionProps {
  selectedCategory: string | null;
  onCategorySelect: (category: string) => void;
}

export const StepCategorySelection: React.FC<StepCategorySelectionProps> = ({
  selectedCategory,
  onCategorySelect,
}) => {
  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-muted-foreground text-center">
        What type of product do you need a quote for?
      </p>

      <div className="gap-4 grid grid-cols-3 w-full max-w-2xl">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => category.enabled && onCategorySelect(category.id)}
            disabled={!category.enabled}
            className={cn(
              "flex flex-col justify-center items-center gap-3 p-6 border-2 rounded-lg transition-all",
              selectedCategory === category.id
                ? "border-blue "
                : "border-gray-200 hover:border-blue",
              !category.enabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <div
              className={cn(
                "flex justify-center items-center rounded-full w-16 h-16",
                selectedCategory === category.id ? "bg-blue/10" : "bg-gray-100"
              )}
            >
              {category.icon}
            </div>
            <span className="font-medium text-sm">{category.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
