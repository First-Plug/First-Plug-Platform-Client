import type { Product } from "@/features/assets";
import EmailTooltip from "./EmailTooltip";

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

  return product.assignedMember ? (
    <span className="font-semibold">{product.assignedMember}</span>
  ) : product.assignedEmail ? (
    <EmailTooltip email={product.assignedEmail} />
  ) : (
    <span className="text-black">-</span>
  );
}
