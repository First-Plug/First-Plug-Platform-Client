"use client";
import { ArrowLeft } from "@/shared";
import { Product } from "@/features/assets";
import { ReturnProduct } from "./ReturnProduct";
import { Dispatch, SetStateAction, useState } from "react";

interface IReturnPage {
  products: Product[];
  handleBack: (action: "open" | "close") => void;
  setSelectedProducts: Dispatch<SetStateAction<Product[]>>;
  selectedProducts: Product[];
}

export function ReturnPage({
  handleBack,
  products,
  setSelectedProducts,
  selectedProducts,
}: IReturnPage) {
  // const [selectedProducts] = useState<Product[]>(products);
  const [enabledProductIndex, setEnabledProductIndex] = useState<number>(0);

  const handleSuccess = () => {
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
      <hr />
      <div className="flex flex-col justify-center items-start text-center">
        <h2 className="font-semibold text-dark-grey">
          Are you sure you want to remove this product from{" "}
          <strong>{products[0].assignedMember}</strong>?
        </h2>
      </div>
      <div className="h-[90%] max-h-[90%] overflow-y-auto scrollbar-custom">
        {products.map((product, index) => (
          <ReturnProduct
            product={product}
            key={product._id}
            selectedProducts={selectedProducts}
            setSelectedProducts={setSelectedProducts}
            isEnabled={enabledProductIndex === index}
            onRemoveSuccess={handleSuccess}
            className={index === products.length - 1 ? "pb-20" : ""}
          />
        ))}
      </div>
    </div>
  );
}
