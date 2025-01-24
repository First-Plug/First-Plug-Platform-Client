interface ProductConditionProps {
  productCondition: "Optimal" | "Defective" | "Unusable";
}

const ConditionColors: Record<
  ProductConditionProps["productCondition"],
  string
> = {
  Optimal: "bg-lightGreen text-black",
  Defective: "bg-[#FFF3B0] text-black",
  Unusable: "bg-[#FFC6D3] text-black",
};

export function ProductConditionCard({
  productCondition,
}: ProductConditionProps) {
  const conditionColorClass =
    ConditionColors[productCondition] || "bg-gray-200 text-black";

  return (
    <span className={`${conditionColorClass} p-1 rounded-md text-sm`}>
      {productCondition}
    </span>
  );
}
