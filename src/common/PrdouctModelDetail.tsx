import { Category, Key, Product } from "@/types";
import React from "react";
interface PrdouctModelDetailProps {
  product: Product;
}
export default function PrdouctModelDetail({
  product,
}: PrdouctModelDetailProps) {
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
    Merchandising: [],
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
    const attribute = attributesToShow.find((at) => at.key === key);
    return attribute ? attribute.value : "-";
  };

  const modelValue = getValue("model");

  return (
    <div className="flex flex-col">
      {product.category === "Merchandising" ? (
        <span className="text-lg">{product.name}</span>
      ) : (
        <div className="flex gap-1 text-md ">
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
      <div className="flex gap-4 text-sm">
        {categoryKeys
          .filter((c) => c !== "brand" && c !== "model")
          .map((cat) => (
            <div className="flex flex-col gap-1 font-normal" key={cat}>
              <span>{cat} </span>
              <span className="-mt-1">{getValue(cat)}</span>
            </div>
          ))}
      </div>
    </div>
  );
}
