import {
  CountryFlag,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared";
import { countriesByCode } from "@/shared/constants/country-codes";
import { normalizeCountryCode } from "@/shared/utils/countryCodeNormalizer";

interface QuoteLocationWithCountryProps {
  country: string;
}

export function QuoteLocationWithCountry({
  country,
}: QuoteLocationWithCountryProps) {
  const normalizedCountry = normalizeCountryCode(country);

  if (!normalizedCountry) {
    return <span>{country || "N/A"}</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <span>
              <CountryFlag countryName={normalizedCountry} size={15} />
            </span>
          </TooltipTrigger>
          <TooltipContent className="bg-blue/80 text-white text-xs">
            {countriesByCode[normalizedCountry] || country}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <span>{countriesByCode[normalizedCountry] || country}</span>
    </div>
  );
}

