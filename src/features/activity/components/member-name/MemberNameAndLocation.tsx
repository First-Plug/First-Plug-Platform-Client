import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  countriesByCode,
  CountryFlag,
} from "@/shared";
import { Product } from "@/features/assets";

export default function MemberNameAndLocation({
  product,
}: {
  product: Product;
}) {
  // Si está asignado a un miembro
  if (product.assignedMember || product.assignedEmail) {
    const countryCode = product.countryCode || (product as any).country;
    const countryName = countryCode
      ? countriesByCode[countryCode] || countryCode
      : "";

    if (product.assignedMember) {
      // Si hay nombre de miembro, mostrar con bandera y país si está disponible
      if (countryCode && countryName) {
        return (
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <div>
                    <CountryFlag
                      countryName={countryCode}
                      size={16}
                      className="rounded-sm"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-blue/80 text-white text-xs">
                  {countryName}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <span>{product.assignedMember}</span>
          </div>
        );
      }
      return <span>{product.assignedMember}</span>;
    } else {
      // Si solo hay email (miembro no encontrado)
      return (
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
      );
    }
  }

  // Si está en una oficina (Our Office)
  if (product.location === "Our office") {
    const officeName =
      product.officeName || product.office?.officeName || "Our office";
    const countryCode =
      product.countryCode ||
      (product as any).country ||
      product.office?.officeCountryCode;
    const countryName = countryCode
      ? countriesByCode[countryCode] || countryCode
      : "";

    if (countryCode && countryName) {
      return (
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <div>
                  <CountryFlag
                    countryName={countryCode}
                    size={16}
                    className="rounded-sm"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-blue/80 text-white text-xs">
                {countryName}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <span>{officeName}</span>
        </div>
      );
    } else if (officeName !== "Our office") {
      return <span>{officeName}</span>;
    }
    return <span>Our office</span>;
  }

  // Si está en FP warehouse
  if (product.location === "FP warehouse") {
    const countryCode =
      product.countryCode ||
      (product as any).country ||
      product.office?.officeCountryCode;
    const countryName = countryCode
      ? countriesByCode[countryCode] || countryCode
      : "";

    if (countryCode && countryName) {
      return (
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <div>
                  <CountryFlag
                    countryName={countryCode}
                    size={16}
                    className="rounded-sm"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-blue/80 text-white text-xs">
                {countryName}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <span>FP warehouse</span>
        </div>
      );
    }
    return <span>FP warehouse</span>;
  }

  // Si está en Employee (casos legacy)
  if (product.location === "Employee") {
    const countryCode = product.countryCode || (product as any).country;
    const countryName = countryCode
      ? countriesByCode[countryCode] || countryCode
      : "";

    if (countryCode && countryName) {
      return (
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <div>
                  <CountryFlag
                    countryName={countryCode}
                    size={16}
                    className="rounded-sm"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-blue/80 text-white text-xs">
                {countryName}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <span>Employee</span>
        </div>
      );
    }
    return <span>Employee</span>;
  }

  // Cualquier otra ubicación
  if (product.location) {
    return <span>{product.location}</span>;
  }

  return <span>N/A</span>;
}
