"use client";
import React from "react";

import { InputProductForm } from "@/features/assets";
import { useFormContext, Controller } from "react-hook-form";
import { type Member } from "@/features/members";

export const AdditionalData = ({
  isUpdate,
  initialData,
}: {
  isUpdate: boolean;
  initialData: Member;
}) => {
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
