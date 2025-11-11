import {
  CountryFlag,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared";
import { countriesByCode } from "@/shared/constants/country-codes";

interface LocationDetails {
  country?: string;
  assignedEmail?: string;
  [key: string]: any;
}

interface ShipmentLocationWithCountryProps {
  location: string; // "Our office", "FP warehouse", "Employee name", etc
  details?: LocationDetails;
}

export function ShipmentLocationWithCountry({
  location,
  details,
}: ShipmentLocationWithCountryProps) {
  const country = details?.country;

  // Si no hay país, mostrar solo la ubicación (registros legacy)
  if (!country) {
    return <span>{location || "N/A"}</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <span>
              <CountryFlag countryName={country} size={15} />
            </span>
          </TooltipTrigger>
          <TooltipContent className="bg-blue/80 text-white text-xs">
            {countriesByCode[country] || country}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <span>{location}</span>
    </div>
  );
}
