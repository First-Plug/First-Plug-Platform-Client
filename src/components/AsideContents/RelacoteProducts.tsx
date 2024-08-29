import { ArrowLeft } from "@/common";
import ProductDetail from "@/common/ProductDetail";
import { Product } from "@/types";
import { useState } from "react";
import { clone } from "mobx-state-tree";
interface IRelacoteProducts {
  products: Product[];
  handleBack: (action: "open" | "close") => void;
  addTaskToQueue: (task: () => Promise<void>, productId) => void;
}

export function RelacoteProducts({
  products,
  handleBack,
  addTaskToQueue,
}: IRelacoteProducts) {
  const [enabledProductIndex, setEnabledProductIndex] = useState(0);

  const handleSuccess = () => {
    if (enabledProductIndex < products.length - 1) {
      setEnabledProductIndex((prevIndex) => prevIndex + 1);
    }
  };

  return (
    <div className="flex flex-col gap-2 h-full max-h-[100%]">
      <div
        className="flex items-center gap-1 font-medium select-none cursor-pointer"
        onClick={() => handleBack("close")}
      >
        <ArrowLeft />
        <p>Back</p>
      </div>
      <div className=" max-h-[100%] h-[100%] overflow-y-auto scrollbar-custom">
        {products.map((product, index) => {
          const clonedProduct = clone(product);

          return (
            <ProductDetail
              product={clonedProduct}
              isRelocating
              key={clonedProduct._id}
              addTaskToQueue={addTaskToQueue}
              onRelocateSuccess={handleSuccess}
              disabled={enabledProductIndex !== index}
            />
          );
        })}
      </div>
    </div>
  );
}
