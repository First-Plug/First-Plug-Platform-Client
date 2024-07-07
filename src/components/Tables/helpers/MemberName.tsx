import { Product } from "@/types";
import EmailTooltip from "./EmailTooltip";

export default function MemberName({ product }: { product: Product }) {
  return product.assignedMember ? (
    <span className="font-semibold"> {product.assignedMember}</span>
  ) : product.assignedEmail ? (
    <EmailTooltip email={product.assignedEmail} />
  ) : (
    "-"
  );
}
