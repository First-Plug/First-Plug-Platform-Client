"use client";
import React from "react";
import { observer } from "mobx-react-lite";
import { SectionTitle } from "@/common";
import { InputProductForm } from "../AddProduct/InputProductForm";
import { DropdownInputProductForm } from "../AddProduct/DropDownProductForm";
import { useFormContext, Controller } from "react-hook-form";
import shipmentData from "./JSON/shipmentdata.json";

const ShipmentData = function ({ isUpdate, initialData }) {
  const { control } = useFormContext();
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
                if (field.type === "dropdown") {
                  return (
                    <DropdownInputProductForm
                      title={field.title}
                      placeholder={field.placeholder}
                      options={field.options}
                      selectedOption={controllerField.value || ""}
                      onChange={controllerField.onChange}
                      name={field.name}
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

export default observer(ShipmentData);
