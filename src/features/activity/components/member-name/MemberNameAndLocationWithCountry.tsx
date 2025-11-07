import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  CountryFlag,
} from "@/shared";
import { Product } from "@/features/assets";
import { countriesByCode } from "@/shared/constants/country-codes";

export default function MemberNameAndLocationWithCountry({
  product,
}: {
  product: Product;
}) {
  // Si es Employee (tiene assignedMember o assignedEmail)
  if (product.assignedMember || product.assignedEmail) {
    const country = product.country || product.countryCode;

    return (
      <div className="flex items-center gap-2">
        {country && (
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
        )}
        {product.assignedMember ? (
          <span>{product.assignedMember}</span>
        ) : (
          <TooltipProvider>
            <Tooltip delayDuration={350}>
              <TooltipTrigger>
                <span className="bg-hoverRed p-1 px-3 rounded-md text-black text-sm cursor-pointer">
                  {product.assignedEmail} ⚠️
                </span>
              </TooltipTrigger>
              <TooltipContent className="bg-white">
                <p className="font-semibold">
                  ❌ This email is not registered as part of your team
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    );
  }

  // Si es Our office
  if (product.location === "Our office") {
    // Formato nuevo: product.office con toda la info
    if (product.office) {
      return (
        <div className="flex items-center gap-2">
          {product.office.officeCountryCode && (
            <TooltipProvider>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <span>
                    <CountryFlag
                      countryName={product.office.officeCountryCode}
                      size={15}
                    />
                  </span>
                </TooltipTrigger>
                <TooltipContent className="bg-blue/80 text-white text-xs">
                  {countriesByCode[product.office.officeCountryCode] ||
                    product.office.officeCountryCode}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <span>{product.office.officeName || "Our office"}</span>
        </div>
      );
    }

    // Formato legacy: officeName y country/countryCode directamente en product
    const officeName = product.officeName || "Our office";
    const country = product.country || product.countryCode;

    return (
      <div className="flex items-center gap-2">
        {country && (
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
        )}
        <span>{officeName}</span>
      </div>
    );
  }

  // Si es FP warehouse
  if (product.location === "FP warehouse") {
    const country = product.country || product.countryCode;

    return (
      <div className="flex items-center gap-2">
        {country && (
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
        )}
        <span>FP warehouse</span>
      </div>
    );
  }

  // Fallback para otros casos o registros sin location
  if (product.location) {
    return <span>{product.location}</span>;
  }

  return <span>N/A</span>;
}
