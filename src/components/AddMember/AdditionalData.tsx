"use client";
import React from "react";
import { observer } from "mobx-react-lite";
import { InputProductForm } from "../AddProduct/InputProductForm";
import { useFormContext, Controller } from "react-hook-form";

const AdditionalData = function ({ isUpdate, initialData }) {
  const { control } = useFormContext();
  return (
    <div className={` ${isUpdate ? "mb-24" : "mb-16"}`}>
      <Controller
        name="additionalInfo"
        control={control}
        render={({ field }) => (
          <InputProductForm
            name="additionalInfo"
            title="Additional Info"
            placeholder="Additional Info"
            type="text"
            value={field.value || ""}
            onChange={(e) => field.onChange(e.target.value)}
          />
        )}
      />
    </div>
  );
};

export default observer(AdditionalData);
