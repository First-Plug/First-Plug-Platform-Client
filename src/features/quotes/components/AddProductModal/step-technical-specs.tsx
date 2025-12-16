"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { MultiSelectInput } from "../MultiSelectInput/multi-select-input";
import { ExtendedWarrantyInput } from "./extended-warranty-input";
import { loadFormFields, getFieldOptions } from "../../utils/loadFormFields";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import type { QuoteProduct } from "../../types/quote.types";

interface StepTechnicalSpecsProps {
  category: string;
  productData: Partial<QuoteProduct>;
  onDataChange: (updates: Partial<QuoteProduct>) => void;
}

export const StepTechnicalSpecs: React.FC<StepTechnicalSpecsProps> = ({
  category,
  productData,
  onDataChange,
}) => {
  const formFields = React.useMemo(() => loadFormFields(category), [category]);

  const handleBrandsChange = (brands: string[]) => {
    onDataChange({ brands });
  };

  const handleModelsChange = (models: string[]) => {
    onDataChange({ models });
  };

  const handleProcessorsChange = (processors: string[]) => {
    onDataChange({ processors });
  };

  const handleAddModel = () => {
    // Este botón permitirá agregar un modelo personalizado
    // Por ahora, se maneja a través del MultiSelectInput
  };

  const getFieldOptionsForName = (fieldName: string): string[] => {
    return getFieldOptions(category, fieldName);
  };

  const ramOptions = getFieldOptionsForName("ram");
  const storageOptions = getFieldOptionsForName("storage");
  const screenOptions = getFieldOptionsForName("screen");

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="w-full text-muted-foreground text-center">
        Select the technical specifications you need. You can select multiple
        options for each field to get quotes for different configurations.
      </p>

      <div className="gap-4 grid grid-cols-2 w-full">
        {/* Quantity */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="quantity">
            Quantity<span className="ml-1 text-red-500">*</span>
          </Label>
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

        {/* Brand - Multi-select */}
        {formFields.find((f) => f.name === "brand") && (
          <div className="flex flex-col gap-2">
            <MultiSelectInput
              title="Brand"
              placeholder="Select brand"
              options={getFieldOptionsForName("brand")}
              selectedValues={productData.brands || []}
              onValuesChange={handleBrandsChange}
            />
          </div>
        )}

        {/* Model - Multi-select with add button */}
        {formFields.find((f) => f.name === "model") && (
          <div className="flex flex-col gap-2">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <MultiSelectInput
                  title="Model"
                  placeholder="Enter model name"
                  options={getFieldOptionsForName("model")}
                  selectedValues={productData.models || []}
                  onValuesChange={handleModelsChange}
                />
              </div>
              <button
                type="button"
                onClick={handleAddModel}
                className="flex justify-center items-center hover:bg-gray-50 border rounded-md w-10 h-10"
                title="Add custom model"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Processor - Multi-select */}
        {formFields.find((f) => f.name === "processor") && (
          <div className="flex flex-col gap-2">
            <MultiSelectInput
              title="Processor"
              placeholder="Select processor"
              options={getFieldOptionsForName("processor")}
              selectedValues={productData.processors || []}
              onValuesChange={handleProcessorsChange}
            />
          </div>
        )}

        {/* RAM - Single select */}
        {ramOptions.length > 0 && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="ram">RAM</Label>
            <Select
              value={productData.ram || ""}
              onValueChange={(value) => onDataChange({ ram: value })}
            >
              <SelectTrigger id="ram">
                <SelectValue placeholder="Select ram" />
              </SelectTrigger>
              <SelectContent>
                {ramOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Storage - Single select */}
        {storageOptions.length > 0 && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="storage">Storage</Label>
            <Select
              value={productData.storage || ""}
              onValueChange={(value) => onDataChange({ storage: value })}
            >
              <SelectTrigger id="storage">
                <SelectValue placeholder="Select storage" />
              </SelectTrigger>
              <SelectContent>
                {storageOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Screen Size - Single select */}
        {screenOptions.length > 0 && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="screenSize">Screen Size</Label>
            <Select
              value={productData.screenSize || ""}
              onValueChange={(value) => onDataChange({ screenSize: value })}
            >
              <SelectTrigger id="screenSize">
                <SelectValue placeholder="Select screen size" />
              </SelectTrigger>
              <SelectContent>
                {screenOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Extended Warranty */}
      <div className="w-full">
        <ExtendedWarrantyInput
          enabled={productData.extendedWarranty?.enabled || false}
          extraYears={productData.extendedWarranty?.extraYears}
          onEnabledChange={(enabled) =>
            onDataChange({
              extendedWarranty: {
                enabled,
                extraYears: enabled
                  ? productData.extendedWarranty?.extraYears || 1
                  : undefined,
              },
            })
          }
          onExtraYearsChange={(years) =>
            onDataChange({
              extendedWarranty: {
                enabled: productData.extendedWarranty?.enabled || false,
                extraYears: years,
              },
            })
          }
        />
      </div>

      {/* Device Enrollment */}
      <div className="flex items-center gap-2 w-full">
        <Checkbox
          id="device-enrollment"
          checked={productData.deviceEnrollment || false}
          onCheckedChange={(checked) =>
            onDataChange({ deviceEnrollment: checked === true })
          }
        />
        <Label htmlFor="device-enrollment">
          Device Enrollment (ABM/Intune/MDM setup)
        </Label>
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
