"use client";

import { ArrowLeft } from "@/shared";

import { ProductDetail } from "@/features/assets";
import { Product } from "@/features/assets";
import { Dispatch, SetStateAction, useState } from "react";

interface IRelacoteProducts {
  products: Product[];
  handleBack: (action: "open" | "close") => void;
  setSelectedProducts: Dispatch<SetStateAction<Product[]>>;
  selectedProducts: Product[];
}

export function RelacoteProducts({
  products,
  handleBack,
  setSelectedProducts,
  selectedProducts,
}: IRelacoteProducts) {
  const [enabledProductIndex, setEnabledProductIndex] = useState(0);

  const handleSuccess = (product: Product) => {
    if (enabledProductIndex < products.length - 1) {
      setEnabledProductIndex((prevIndex) => prevIndex + 1);
    }
  };

  return (
    <div className="flex flex-col gap-2 h-full max-h-[100%]">
      <div
        className="flex items-center gap-1 font-medium cursor-pointer select-none"
        onClick={() => handleBack("close")}
      >
        <ArrowLeft />
        <p>Back</p>
      </div>
      <div className="h-[100%] max-h-[100%] overflow-y-auto scrollbar-custom">
        {products.map((product, index) => {
          return (
            <ProductDetail
              product={product}
              isRelocating
              key={product._id}
              onRelocateSuccess={() => handleSuccess(product)}
              disabled={enabledProductIndex !== index}
            />
          );
        })}
      </div>
    </div>
  );
}
