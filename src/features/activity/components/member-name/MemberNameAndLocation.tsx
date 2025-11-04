import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  countriesByCode,
} from "@/shared";
import { Product } from "@/features/assets";

export default function MemberNameAndLocation({
  product,
}: {
  product: Product;
}) {
  // Si está asignado a un miembro
  if (product.assignedMember || product.assignedEmail) {
    const countryCode = product.countryCode;
    const countryName = countryCode
      ? countriesByCode[countryCode] || countryCode
      : "";

    if (product.assignedMember) {
      // Si hay nombre de miembro, mostrar con país si está disponible
      if (countryName) {
        return <span>{`${product.assignedMember} (${countryName})`}</span>;
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
      product.countryCode || product.office?.officeCountryCode;
    const countryName = countryCode
      ? countriesByCode[countryCode] || countryCode
      : "";

    if (countryName && officeName !== "Our office") {
      return <span>{`${officeName} (${countryName})`}</span>;
    } else if (countryName) {
      return <span>{`Our office (${countryName})`}</span>;
    } else if (officeName !== "Our office") {
      return <span>{officeName}</span>;
    }
    return <span>Our office</span>;
  }

  // Si está en FP warehouse
  if (product.location === "FP warehouse") {
    const countryCode =
      product.countryCode || product.office?.officeCountryCode;
    const countryName = countryCode
      ? countriesByCode[countryCode] || countryCode
      : "";

    if (countryName) {
      return <span>{`FP warehouse (${countryName})`}</span>;
    }
    return <span>FP warehouse</span>;
  }

  // Si está en Employee (casos legacy)
  if (product.location === "Employee") {
    const countryCode = product.countryCode;
    const countryName = countryCode
      ? countriesByCode[countryCode] || countryCode
      : "";

    if (countryName) {
      return <span>{`Employee (${countryName})`}</span>;
    }
    return <span>Employee</span>;
  }

  // Cualquier otra ubicación
  if (product.location) {
    return <span>{product.location}</span>;
  }

  return <span>N/A</span>;
}
