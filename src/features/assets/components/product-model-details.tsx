import { Category, Key, Product } from "@/features/assets";
import React from "react";
interface PrdouctModelDetailProps {
  product: Product;
  isOffboardingStyles?: boolean;
}
export const PrdouctModelDetail = ({
  product,
  isOffboardingStyles,
}: PrdouctModelDetailProps) => {
  if (!product) return null;
  const { attributes } = product;

  if (!attributes) {
    return (
      <div>
        <span>No attributes available</span>
      </div>
    );
  }

  const CATEGORY_KEYS: Record<Category, readonly Key[]> = {
    Merchandising: ["color"],
    Computer: ["processor", "ram", "storage", "screen"],
    Monitor: ["brand", "model", "screen"],
    Audio: ["brand", "model"],
    Peripherals: ["brand", "model"],
    Other: ["brand", "model"],
  };
  const categoryKeys = CATEGORY_KEYS[product.category];
  const attributesToShow = attributes.filter((attribute) =>
    categoryKeys.includes(attribute.key)
  );

  const getValue = (key: Key) => {
    let attribute = attributesToShow.find((at) => at.key === key);
    if (!attribute) {
      attribute = attributes.find((at) => at.key === key);
    }
    return attribute ? attribute.value : "-";
  };

  const modelValue = getValue("model");
  const colorValue = getValue("color");

  return (
    <div className="flex flex-col">
      {product.category === "Merchandising" ? (
        <div className="flex gap-1 font-semibold text-md">
          <span>{product.name}</span>
        </div>
      ) : (
        <div className="flex gap-1 text-md">
          <span className="font-semibold">
            {attributes.filter((at) => at.key === "brand")[0]?.value || "-"}
          </span>
          <span className="font-normal">
            {attributes.filter((at) => at.key === "model")[0]?.value || "-"}
          </span>
          {modelValue === "Other" &&
            product.name &&
            product.name.trim() !== "" && (
              <span className="font-normal">- {product.name}</span>
            )}
        </div>
      )}
      <div
        className={`flex gap-6 ${
          isOffboardingStyles
            ? "grid gap-4 text-sm lg:grid-cols-2 xl:grid-cols-4"
            : ""
        }`}
      >
        {categoryKeys
          .filter((c) => c !== "brand" && c !== "model")
          .map((cat) => (
            <div className="flex flex-col gap-1 font-normal" key={cat}>
              <span>{cat}</span>
              <span className="-mt-1">{getValue(cat)}</span>
            </div>
          ))}
      </div>
    </div>
  );
};
