import { Product } from "@/types";
import { useEffect, useState } from "react";
import ProgressCircle from "./ProgressCircle";

interface ComputerUpdateCardProps {
  products: any[];
}

export const ComputerUpdateCard = ({ products }: ComputerUpdateCardProps) => {
  const [productsWithDate, setProductsWithDate] = useState<number>(0);
  const [productsWithoutDate, setProductsWithoutDate] = useState<number>(0);

  useEffect(() => {
    const realProducts = products.flatMap((category) => category.products);

    const totalWithDate = realProducts.filter(
      (product) => product.acquisitionDate && product.acquisitionDate !== ""
    ).length;
    const totalProducts = realProducts.length;
    const totalWithoutDate = totalProducts - totalWithDate;

    setProductsWithDate(totalWithDate);
    setProductsWithoutDate(totalWithoutDate);
  }, [products]);

  return (
    <div className="flex flex-col items-start">
      <div className="mb-4">
        <ProgressCircle
          productsWithDate={productsWithDate}
          productsWithoutDate={productsWithoutDate}
        />
      </div>
    </div>
  );
};
