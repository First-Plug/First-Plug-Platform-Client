import type { Product } from "@/features/assets";
import EmailTooltip from "./EmailTooltip";
import { countriesByCode } from "@/shared/constants/country-codes";

import { ArrowRight } from "lucide-react";

export default function MemberName({ product }: { product: Product }) {
  if (
    product.status === "In Transit - Missing Data" ||
    product.status === "In Transit"
  ) {
    return (
      <span className="flex items-center gap-1 font-semibold">
        <span>{product.shipmentOrigin}</span>
        <span>
          <ArrowRight size={14} />
        </span>
        <span>{product.shipmentDestination}</span>
      </span>
    );
  }

  // Si está asignado a un miembro, mostrar el nombre del miembro
  if (product.assignedMember) {
    return <span className="font-semibold">{product.assignedMember}</span>;
  }

  // Si tiene email asignado, mostrar el email
  if (product.assignedEmail) {
    return <EmailTooltip email={product.assignedEmail} />;
  }

  // Si está en "Our office" y tiene officeName, mostrar el nombre de la oficina
  if (product.location === "Our office" && product.officeName) {
    return <span className="font-semibold">{product.officeName}</span>;
  }

  // Si está en "Our office" pero no tiene información de oficina, mostrar "Our office"
  if (product.location === "Our office") {
    return <span className="font-semibold">Our office</span>;
  }

  // Por defecto, mostrar "-"
  return <span className="text-black">-</span>;
}
