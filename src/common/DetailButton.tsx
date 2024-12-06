"use client";
import { MouseEvent } from "react";
import { ArrowRight } from "@/common";
import { usePrefetchAssets } from "@/assets/hooks";
import { Button } from "@/common";

interface DetailsButtonProps {
  row: any;
}

export const DetailsButton = ({ row }: DetailsButtonProps) => {
  const { prefetchAssets } = usePrefetchAssets();

  const handleClick = async (event: MouseEvent) => {
    event.stopPropagation();
    await prefetchAssets();
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
