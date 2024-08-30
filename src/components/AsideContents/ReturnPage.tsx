import { ArrowLeft } from "@/common";
import { Product } from "@/types";
import { ReturnProduct } from "./ReturnProduct";
import { useState } from "react";

interface IReturnPage {
  products: Product[];
  handleBack: (action: "open" | "close") => void;
  addTaskToQueue: (task: () => Promise<void>, productId) => void;
}

export function ReturnPage({
  handleBack,
  products,
  addTaskToQueue,
}: IReturnPage) {
  const [selectedProducts] = useState<Product[]>(products);
  const [enabledProductIndex, setEnabledProductIndex] = useState<number>(0);

  const handleSuccess = () => {
    if (enabledProductIndex < products.length - 1) {
      setEnabledProductIndex((prevIndex) => prevIndex + 1);
    }
  };

  return (
    <div className="flex flex-col gap-2  h-full max-h-[100%]">
      <div
        className="flex items-center gap-1 font-medium select-none cursor-pointer"
        onClick={() => handleBack("close")}
      >
        <ArrowLeft />
        <p>Back</p>
      </div>
      <hr />
      <div className="text-center flex justify-center flex-col items-start">
        <h2 className="font-semibold text-dark-grey ">
          Are you sure you want to remove this product from{" "}
          <strong>{products[0].assignedMember}</strong>?
        </h2>
      </div>
      <div className=" max-h-[90%] h-[90%] overflow-y-auto scrollbar-custom">
        {products.map((product, index) => (
          <ReturnProduct
            product={product}
            key={product._id}
            selectedProducts={selectedProducts}
            isEnabled={enabledProductIndex === index}
            onRemoveSuccess={handleSuccess}
          />
        ))}
      </div>
    </div>
  );
}
