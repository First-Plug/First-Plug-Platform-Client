"use client";

import * as React from "react";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

import type { QuoteProduct } from "../../types/quote.types";

interface StepMerchandisingSpecsProps {
  productData: Partial<QuoteProduct>;
  onDataChange: (updates: Partial<QuoteProduct>) => void;
}

export const StepMerchandisingSpecs: React.FC<StepMerchandisingSpecsProps> = ({
  productData,
  onDataChange,
}) => {
  return (
    <div className="flex flex-col items-center gap-6">
      <p className="w-full text-muted-foreground text-left">
        Describe the merchandising items you need (clothing, mugs, thermoses,
        pens, notebooks, backpacks, onboarding kits, birthday/anniversary gifts,
        etc.).
      </p>

      {/* Quantity - Full width row */}
      <div className="w-full">
        <div className="flex flex-col gap-2 max-w-[calc(50%-0.5rem)]">
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
      </div>

      {/* Description */}
      <div className="flex flex-col gap-2 w-full">
        <Label htmlFor="description">
          Description<span className="ml-1 text-red-500">*</span>
        </Label>
        <textarea
          id="description"
          placeholder="Describe the items you need: type of product, colors, sizes, branding requirements, etc."
          value={productData.description || ""}
          onChange={(e) => onDataChange({ description: e.target.value })}
          rows={4}
          required
          className="flex bg-background disabled:opacity-50 px-3 py-2 border border-input rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ring-offset-background focus-visible:ring-offset-2 w-full min-h-[80px] placeholder:text-muted-foreground text-sm disabled:cursor-not-allowed"
        />
      </div>

      {/* Additional Requirements */}
      <div className="flex flex-col gap-2 w-full">
        <Label htmlFor="additionalRequirements">
          Additional Requirements (optional)
        </Label>
        <textarea
          id="additionalRequirements"
          placeholder="Custom Packaging, logo placement, special materials, eco-friendly options, etc."
          value={productData.additionalRequirements || ""}
          onChange={(e) =>
            onDataChange({ additionalRequirements: e.target.value })
          }
          rows={3}
          className="flex bg-background disabled:opacity-50 px-3 py-2 border border-input rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ring-offset-background focus-visible:ring-offset-2 w-full min-h-[60px] placeholder:text-muted-foreground text-sm disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );
};
