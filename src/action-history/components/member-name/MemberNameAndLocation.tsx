import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Product } from "@/types";

export default function MemberNameAndLocation({
  product,
}: {
  product: Product;
}) {
  return product.assignedMember || product.assignedEmail ? (
    <span>
      {product.assignedMember ? (
        product.assignedMember
      ) : (
        <TooltipProvider>
          <Tooltip delayDuration={350}>
            <TooltipTrigger>
              <span className="cursor-pointer text-sm bg-hoverRed p-1 px-3 rounded-md text-black ">
                {product.assignedEmail} ⚠️
              </span>
            </TooltipTrigger>
            <TooltipContent className="bg-white">
              <p className=" font-semibold ">
                {" "}
                ❌ This email is not registered as part of your team
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </span>
  ) : product.location ? (
    <span>{product.location}</span>
  ) : (
    <span>N/A</span>
  );
}
