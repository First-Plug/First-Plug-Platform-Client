"use client";

import * as React from "react";
import { MultiSelectInput } from "../MultiSelectInput/multi-select-input";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

import type { QuoteProduct } from "../../types/quote.types";

interface StepOtherSpecsProps {
  productData: Partial<QuoteProduct>;
  onDataChange: (updates: Partial<QuoteProduct>) => void;
}

export const StepOtherSpecs: React.FC<StepOtherSpecsProps> = ({
  productData,
  onDataChange,
}) => {
  const handleBrandsChange = (brands: string[]) => {
    onDataChange({ brands });
  };

  const handleModelsChange = (models: string[]) => {
    onDataChange({ models });
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="w-full text-muted-foreground text-left">
        Specify the product details for your quote request.
      </p>

      <div className="gap-4 grid grid-cols-2 w-full">
        {/* Quantity */}
        <div className="flex flex-col gap-2">
          <label htmlFor="quantity" className="font-medium text-sm">
            Quantity<span className="ml-1 text-red-500">*</span>
          </label>
          <Input
            id="quantity"
            type="number"
            min="1"
            value={productData.quantity ?? 1}
            onChange={(e) =>
              onDataChange({
                quantity: parseInt(e.target.value, 10) || 1,
              })
            }
            required
          />
        </div>

        {/* Brand - Multi-select (opcional, sin opciones precargadas) */}
        <div className="flex flex-col gap-2">
          <MultiSelectInput
            title="Brand"
            placeholder="Enter brand"
            options={[]}
            selectedValues={productData.brands || []}
            onValuesChange={handleBrandsChange}
          />
        </div>

        {/* Model - Multi-select (opcional, sin opciones precargadas) */}
        <div className="flex flex-col gap-2">
          <MultiSelectInput
            title="Model"
            placeholder="Enter model name"
            options={[]}
            selectedValues={productData.models || []}
            onValuesChange={handleModelsChange}
          />
        </div>
      </div>

      {/* Other Specifications */}
      <div className="flex flex-col gap-2 w-full">
        <Label htmlFor="otherSpecifications">Other Specifications</Label>
        <textarea
          id="otherSpecifications"
          placeholder="Any additional specifications or requirements..."
          value={productData.otherSpecifications || ""}
          onChange={(e) =>
            onDataChange({ otherSpecifications: e.target.value })
          }
          rows={4}
          className="flex bg-background disabled:opacity-50 px-3 py-2 border border-input rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ring-offset-background focus-visible:ring-offset-2 w-full min-h-[80px] placeholder:text-muted-foreground text-sm disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );
};

