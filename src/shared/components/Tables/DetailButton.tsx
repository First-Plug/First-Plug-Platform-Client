"use client";
import { MouseEvent } from "react";
import { ArrowRight, Button } from "@/shared";

interface DetailsButtonProps {
  row: any;
}

export const DetailsButton = ({ row }: DetailsButtonProps) => {
  const handleClick = async (event: MouseEvent) => {
    event.stopPropagation();
    row.getToggleExpandedHandler()();
  };

  return (
    <Button variant="text" className="relative" onClick={handleClick}>
      <span>Details</span>
      <ArrowRight
        className={`transition-all duration-200 ${
          row.getIsExpanded() ? "rotate-[90deg]" : "rotate-[0]"
        }`}
      />
    </Button>
  );
};
