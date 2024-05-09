import { Product } from "@/types";
import Image from "next/image";
import React from "react";
interface ProductImageProps {
  category: string;
}
export function ProductImage({ category }: ProductImageProps) {
  return (
    <div className="relative h-20  aspect-square   ">
      <Image
        src={`/stock/${category}.png`}
        alt={`${category} First Plug Stock`}
        fill
        objectFit="contain"
        className=" drop-shadow-lg "
      />
    </div>
  );
}
