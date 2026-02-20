"use client";

import * as React from "react";
import { MultiSelectInput } from "../MultiSelectInput/multi-select-input";
import { loadFormFields, getFieldOptions } from "../../utils/loadFormFields";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

import type { QuoteProduct } from "../../types/quote.types";

interface StepTabletSpecsProps {
  productData: Partial<QuoteProduct>;
  onDataChange: (updates: Partial<QuoteProduct>) => void;
}

export const StepTabletSpecs: React.FC<StepTabletSpecsProps> = ({
  productData,
  onDataChange,
}) => {
  const category = "tablet";
  const formFields = React.useMemo(() => loadFormFields(category), []);

  const handleBrandsChange = (brands: string[]) => {
    onDataChange({ brands });
  };

  const handleModelsChange = (models: string[]) => {
    onDataChange({ models });
  };

  const handleScreenSizeChange = (screenSize: string[]) => {
    onDataChange({ screenSize });
  };

  const getFieldOptionsForName = (fieldName: string): string[] => {
    return getFieldOptions(category, fieldName);
  };

  const screenOptions = getFieldOptionsForName("screen");

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="w-full text-muted-foreground text-left">
        Select the tablet specifications you need. You can select multiple
        options for each field.
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

      <div className="gap-4 grid grid-cols-2 w-full">
        {/* Brand - Multi-select */}
        {formFields.find((f) => f.name === "brand") && (
          <div className="flex flex-col gap-2">
            <MultiSelectInput
              title="Brand"
              placeholder="Enter brand"
              options={getFieldOptionsForName("brand")}
              selectedValues={productData.brands || []}
              onValuesChange={handleBrandsChange}
            />
          </div>
        )}

        {/* Model - Multi-select */}
        {formFields.find((f) => f.name === "model") && (
          <div className="flex flex-col gap-2">
            <MultiSelectInput
              title="Model"
              placeholder="Enter model name"
              options={getFieldOptionsForName("model")}
              selectedValues={productData.models || []}
              onValuesChange={handleModelsChange}
            />
          </div>
        )}

        {/* Screen Size - Multi-select */}
        {screenOptions.length > 0 && (
          <div className="flex flex-col gap-2">
            <MultiSelectInput
              title="Screen Size"
              placeholder="Enter screen size"
              options={screenOptions}
              selectedValues={productData.screenSize || []}
              onValuesChange={handleScreenSizeChange}
            />
          </div>
        )}
      </div>

      {/* Other Specifications */}
      <div className="flex flex-col gap-2 w-full">
        <Label htmlFor="otherSpecifications">Other Specifications</Label>
        <textarea
          id="otherSpecifications"
          placeholder="Storage capacity, color, connectivity (Wi-Fi, Cellular), accessories (stylus, keyboard), etc."
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
