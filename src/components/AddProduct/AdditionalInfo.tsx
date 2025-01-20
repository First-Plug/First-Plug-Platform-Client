"use client";
import React from "react";
import { observer } from "mobx-react-lite";
import { InputProductForm } from "@/components/AddProduct/InputProductForm";
import { useFormContext, Controller } from "react-hook-form";

const AdditionalInfo = function ({ isUpdate, initialData }) {
  const { control } = useFormContext();

  return (
    <div className={` ${isUpdate ? "mb-10" : "mb-10"}`}>
      <Controller
        name="additionalInfo"
        control={control}
        render={({ field }) => (
          <InputProductForm
            name="additionalInfo"
            title="Additional Info"
            placeholder="Enter additional info"
            type="text"
            value={field.value || ""}
            onChange={(e) => field.onChange(e.target.value)}
            className="w-full"
          />
        )}
      />
    </div>
  );
};

export default observer(AdditionalInfo);
