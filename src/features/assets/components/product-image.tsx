import Image from "next/image";
import React from "react";
interface ProductImageProps {
  category: string;
}
export const ProductImage = ({ category }: ProductImageProps) => {
  return (
    <div className="relative h-16 aspect-square">
      <Image
        src={`/stock/${category}.png`}
        alt={`${category} First Plug Stock`}
        fill
        objectFit="contain"
        className="drop-shadow-lg"
      />
    </div>
  );
};
