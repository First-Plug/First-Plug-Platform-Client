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
  let countryCode: string | null = null;

  if (product) {
    if (product.office) {
      countryCode = product.office.officeCountryCode;
    } else if (product.fpWarehouse) {
      countryCode = product.fpWarehouse.warehouseCountryCode;
    } else if (product.memberData) {
      countryCode = product.memberData.countryCode;
    }
  }

  const countryName = countryCode
    ? countriesByCode[countryCode.toUpperCase()]
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
        {countryCode && (
          <TooltipProvider>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <span>
                  <CountryFlag
                    countryName={countryCode}
                    size={14}
                    className="rounded-sm"
                  />
                </span>
              </TooltipTrigger>
              <TooltipContent className="bg-blue/80 text-white text-xs">
                {countryName || countryCode}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </span>
    </div>
  );
}
