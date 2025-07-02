"use client";
import { Controller, useFormContext } from "react-hook-form";
import { DropdownInputProductForm } from "@/features/assets";
import { PRODUCT_CONDITIONS } from "@/features/assets";

export const ProductCondition = ({ isUpdate, isDisabled, selectedOption }) => {
  const { control } = useFormContext();
  return (
    <div className={` ${isUpdate ? "mb-6" : "mb-10"}`}>
      <Controller
        name="productCondition"
        control={control}
        render={({ field }) => (
          <DropdownInputProductForm
            options={PRODUCT_CONDITIONS}
            placeholder="Select Product Condition"
            title="Product Condition"
            name="productCondition"
            selectedOption={
              isUpdate
                ? selectedOption || field.value || "Optimal"
                : selectedOption || field.value || ""
            }
            onChange={(value) => field.onChange(value)}
            searchable={false}
            className="w-full"
            disabled={isDisabled}
          />
        )}
      />
    </div>
  );
};
