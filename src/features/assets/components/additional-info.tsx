"use client";
import { useFormContext, Controller } from "react-hook-form";

import { InputProductForm } from "@/features/assets";

interface AdditionalInfoProps {
  isUpdate: boolean;
  initialData: any;
  disabled?: boolean;
}

export const AdditionalInfo: React.FC<AdditionalInfoProps> = function ({
  isUpdate,
  initialData,
  disabled = false,
}) {
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
            disabled={disabled}
          />
        )}
      />
    </div>
  );
};
