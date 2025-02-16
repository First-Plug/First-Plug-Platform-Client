import EmailTooltip from "@/components/Tables/helpers/EmailTooltip";
import { Product } from "@/types";

export default function MemberNameAndLocation({
  product,
}: {
  product: Product;
}) {
  return product.assignedMember || product.assignedEmail ? (
    <span className="font-semibold">
      {product.assignedMember ? (
        product.assignedMember
      ) : (
        <EmailTooltip email={product.assignedEmail} />
      )}
    </span>
  ) : product.location ? (
    <span>{product.location}</span>
  ) : (
    <span>N/A</span>
  );
}
