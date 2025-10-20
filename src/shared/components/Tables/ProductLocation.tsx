import { Location, Product } from "@/features/assets";
import {
  CountryFlag,
  countriesByCode,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared";
import React from "react";

interface ProductLocationProps {
  location: Location;
  product?: Product;
}

export function ProductLocation({ location, product }: ProductLocationProps) {
  const countryName = product?.countryCode
    ? countriesByCode[product?.countryCode.toUpperCase()]
    : null;

  return (
    <div className="inline-flex items-center">
      <span
        className={`p-1 px-2 text-xs inline-flex items-center gap-1.5 ${
          location
            ? location === "Employee"
              ? "bg-lightPurple"
              : "bg-lightGreen"
            : "bg-light-grey"
        } rounded-md`}
      >
        {location ? location : "No Location"}
        {product?.countryCode && (
          <TooltipProvider>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <span>
                  <CountryFlag
                    countryName={product?.countryCode}
                    size={14}
                    className="rounded-sm"
                  />
                </span>
              </TooltipTrigger>
              <TooltipContent className="bg-blue/80 text-white text-xs">
                {countryName || product?.countryCode}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </span>
    </div>
  );
}
