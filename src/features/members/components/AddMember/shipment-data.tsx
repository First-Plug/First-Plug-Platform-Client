"use client";

import { useFormContext, Controller } from "react-hook-form";

import { SectionTitle } from "@/shared";
import { type Member } from "@/features/members";
import { shipmentData } from "./data/shipmentdata";
import { countriesByCode } from "@/shared/constants/country-codes";

import { InputProductForm, DropdownInputProductForm } from "@/features/assets";

export const ShipmentData = ({
  isUpdate,
}: {
  isUpdate: boolean;
  initialData: Member;
}) => {
  const { control } = useFormContext();

  // Convert countriesByCode to options format for dropdown
  const countryOptions = Object.entries(countriesByCode).map(
    ([code, name]) => ({
      label: name,
      value: code,
    })
  );

  return (
    <div>
      <SectionTitle>Shipment Details</SectionTitle>

      <div
        className={`grid gap-2 ${
          isUpdate ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 lg:grid-cols-3"
        }`}
      >
        {shipmentData.fields.map((field, index) => (
          <div key={index}>
            <Controller
              name={field.name}
              control={control}
              render={({ field: controllerField }) => {
                if (field.type === "dropdown" && field.name === "country") {
                  return (
                    <DropdownInputProductForm
                      title={field.title}
                      placeholder={field.placeholder}
                      options={countryOptions.map((option) => option.label)}
                      selectedOption={
                        controllerField.value
                          ? countriesByCode[controllerField.value] ||
                            controllerField.value
                          : ""
                      }
                      onChange={(selectedCountryName) => {
                        const countryCode = Object.entries(
                          countriesByCode
                        ).find(
                          ([code, name]) => name === selectedCountryName
                        )?.[0];
                        controllerField.onChange(countryCode);
                      }}
                      name={field.name}
                      searchable={true}
                    />
                  );
                } else if (field.type === "dropdown") {
                  return (
                    <DropdownInputProductForm
                      title={field.title}
                      placeholder={field.placeholder}
                      options={field.options}
                      selectedOption={controllerField.value || ""}
                      onChange={controllerField.onChange}
                      name={field.name}
                      searchable={true}
                    />
                  );
                } else {
                  return (
                    <InputProductForm
                      name={field.name}
                      type={field.type}
                      placeholder={field.placeholder}
                      title={field.title}
                      value={controllerField.value || ""}
                      onChange={controllerField.onChange}
                    />
                  );
                }
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
