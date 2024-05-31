"use Client";
import React from "react";
import { observer } from "mobx-react-lite";
import { Input, SectionTitle } from "@/common";
import { DropdownInputProductForm } from "../AddProduct/DropDownProductForm";
import { InputProductForm } from "../AddProduct/InputProductForm";
import { FormInput } from "@/components";
import { CustomLink } from "@/common";
import { useFormContext, Controller } from "react-hook-form";

const EmployeeData = function ({ teams }) {
  const {
    setValue,
    watch,
    control,
    formState: { errors },
    clearErrors,
  } = useFormContext();
  return (
    <div>
      <SectionTitle>Employee information</SectionTitle>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        <Controller
          name="team"
          control={control}
          render={({ field }) => (
            <DropdownInputProductForm
              name="team"
              options={teams}
              placeholder="Team Name"
              title="Team Name"
              selectedOption={field.value || ""}
              onChange={(value) => field.onChange(value)}
              required={"required"}
            />
          )}
        />
        <Controller
          name="position"
          control={control}
          render={({ field }) => (
            <InputProductForm
              placeholder="Job Position"
              title="Job Position"
              type="text"
              value={field.value || ""}
              onChange={(e) => field.onChange(e.target.value)}
              required={"required"}
            />
          )}
        />

        <Controller
          name="startDate"
          control={control}
          render={({ field }) => (
            <InputProductForm
              placeholder="Start Date"
              title="Start Date"
              type="date"
              value={field.value || ""}
              onChange={(e) => field.onChange(e.target.value)}
              required={"required"}
            />
          )}
        />
      </div>
      <div>
        <p className="font-inter text-[16px] text-dark-grey">
          Does the team not exist yet?
        </p>
        <CustomLink href="">Create Team</CustomLink>
      </div>
    </div>
  );
};

export default observer(EmployeeData);
