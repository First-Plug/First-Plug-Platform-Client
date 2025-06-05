"use client";
import { AddIcon, MinusIcon } from "@/shared";

interface QuantityCounterProps {
  quantity: number;
  setQuantity: (value: number) => void;
}

export const QuantityCounter: React.FC<QuantityCounterProps> = ({
  quantity,
  setQuantity,
}) => {
  return (
    <div className="flex flex-col items-start mb-6 ml-2">
      <p className="block ml-2 font-sans text-dark-grey">Product Quantity</p>
      <div className="flex items-center p-4 border rounded-xl w-full h-14 text-black">
        <button
          type="button"
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          className="px-2"
        >
          <MinusIcon />
        </button>
        <input
          type="number"
          value={quantity}
          onChange={(e) => {
            const value = Math.max(
              1,
              Math.min(99, parseInt(e.target.value) || 1)
            );
            setQuantity(value);
          }}
          className="mx-2 w-12 text-center"
        />
        <button
          type="button"
          onClick={() => setQuantity(Math.min(99, quantity + 1))}
          className="px-2"
        >
          <AddIcon />
        </button>
      </div>
    </div>
  );
};
