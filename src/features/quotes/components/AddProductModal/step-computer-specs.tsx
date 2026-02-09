"use client";

import * as React from "react";
import { MultiSelectInput } from "../MultiSelectInput/multi-select-input";
import { ExtendedWarrantyInput } from "./extended-warranty-input";
import { loadFormFields, getFieldOptions } from "../../utils/loadFormFields";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Checkbox } from "@/shared/components/ui/checkbox";

import type { QuoteProduct } from "../../types/quote.types";

interface StepComputerSpecsProps {
  productData: Partial<QuoteProduct>;
  onDataChange: (updates: Partial<QuoteProduct>) => void;
}

export const StepComputerSpecs: React.FC<StepComputerSpecsProps> = ({
  productData,
  onDataChange,
}) => {
  const category = "computer";
  const formFields = React.useMemo(() => loadFormFields(category), []);

  const handleBrandsChange = (brands: string[]) => {
    onDataChange({ brands });
  };

  const handleModelsChange = (models: string[]) => {
    onDataChange({ models });
  };

  const handleProcessorsChange = (processors: string[]) => {
    onDataChange({ processors });
  };

  const handleRAMChange = (ram: string[]) => {
    // Agregar "GB" a cada valor antes de guardar
    const ramWithGB = ram.map((value) => {
      // Si ya tiene GB, no agregarlo de nuevo
      if (value.endsWith("GB")) {
        return value;
      }
      // Si es solo un número, agregar GB
      return `${value}GB`;
    });
    onDataChange({ ram: ramWithGB });
  };

  const handleStorageChange = (storage: string[]) => {
    onDataChange({ storage });
  };

  const getFieldOptionsForName = (fieldName: string): string[] => {
    return getFieldOptions(category, fieldName);
  };

  const ramOptionsRaw = getFieldOptionsForName("ram");
  // Filtrar opciones de RAM para mostrar solo números (sin GB)
  const ramOptions = ramOptionsRaw.map((option) => option.replace("GB", ""));
  const storageOptions = getFieldOptionsForName("storage");

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="w-full text-muted-foreground text-left">
        Select the technical specifications you need. You can select multiple
        options for each field to get quotes for different configurations.
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

        {/* Processor - Multi-select */}
        {formFields.find((f) => f.name === "processor") && (
          <div className="flex flex-col gap-2">
            <MultiSelectInput
              title="Processor"
              placeholder="Enter processor"
              options={getFieldOptionsForName("processor")}
              selectedValues={productData.processors || []}
              onValuesChange={handleProcessorsChange}
            />
          </div>
        )}

        {/* RAM - Multi-select */}
        {ramOptions.length > 0 && (
          <div className="flex flex-col gap-2">
            <MultiSelectInput
              title="RAM (GB)"
              placeholder="Enter RAM"
              options={ramOptions}
              selectedValues={
                productData.ram
                  ? productData.ram.map((value) => value.replace("GB", ""))
                  : []
              }
              onValuesChange={handleRAMChange}
              inputMode="numeric"
            />
          </div>
        )}

        {/* Storage - Multi-select */}
        {storageOptions.length > 0 && (
          <div className="flex flex-col gap-2">
            <MultiSelectInput
              title="Storage"
              placeholder="Enter storage"
              options={storageOptions}
              selectedValues={productData.storage || []}
              onValuesChange={handleStorageChange}
            />
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
