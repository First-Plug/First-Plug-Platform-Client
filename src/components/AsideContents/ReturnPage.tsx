import { ArrowLeft } from "@/common";
import { Product } from "@/types";

import { ReturnProduct } from "./ReturnProduct";

interface IReturnPage {
  products: Product[];
  handleBack: (action: "open" | "close") => void;
}

export function ReturnPage({ handleBack, products }: IReturnPage) {
  return (
    <div className="flex flex-col gap-2">
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
      {products.map((product) => (
        <ReturnProduct product={product} key={product._id} />
      ))}
    </div>
  );
}
