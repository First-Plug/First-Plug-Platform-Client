"use client";
import React from "react";
import { AddIcon, MinusIcon } from "@/common";

interface QuantityCounterProps {
  quantity: number;
  setQuantity: (value: number) => void;
}

const QuantityCounter: React.FC<QuantityCounterProps> = ({
  quantity,
  setQuantity,
}) => {
  return (
    <div className="flex flex-col items-start ml-4">
      <p className="block text-dark-grey font-sans ml-2">Product Quantity</p>
      <div className="flex items-center h-14 border rounded-xl p-4 text-black w-full">
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
          className="w-12 text-center mx-2"
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

export default QuantityCounter;
