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
    <div>
      <p className="block text-dark-grey ml-4 font-sans">
        Choose Product Quantity
      </p>

      <div className="flex items-center h-14 ml-8 border rounded-xl p-4 text-black">
        <button
          type="button"
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
        >
          <MinusIcon />
        </button>
        <input
          type="number"
          value={quantity}
          onChange={(e) =>
            setQuantity(Math.max(1, parseInt(e.target.value) || 1))
          }
          className="w-12 text-center mx-2"
        />
        <button type="button" onClick={() => setQuantity(quantity + 1)}>
          <AddIcon />
        </button>
      </div>
    </div>
  );
};

export default QuantityCounter;
