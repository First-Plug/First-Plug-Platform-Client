"use client";
import React from "react";
import { DropdownInputProductForm } from "./DropDownProductForm";
import othersData from "./JSON/othersform.json";

export const OthersForm = function () {
  const [brand, setBrand] = React.useState("");
  const [model, setModel] = React.useState("");
  const [color, setColor] = React.useState("");

  const brandOptions = othersData.brands;
  const modelOptions = othersData.models;
  const colorOptions = othersData.colors;

  return (
    <>
      <div w-full>
        <div className="flex flex-col lg:flex-row gap-4">
          <DropdownInputProductForm
            options={brandOptions}
            placeholder="Brand"
            title="Brand"
            selectedOption={brand}
            onChange={(option) => {
              setBrand(option);
            }}
            required="required"
          />
          <DropdownInputProductForm
            options={modelOptions}
            placeholder="Model"
            title="Model"
            selectedOption={model}
            onChange={(option) => setModel(option)}
            required="required"
          />
        </div>
        <div className="flex flex-col lg:flex-row gap-4">
          <DropdownInputProductForm
            options={colorOptions}
            placeholder="Color"
            title="Color"
            selectedOption={color}
            onChange={(option) => setColor(option)}
            required="required"
          />
        </div>
      </div>
    </>
  );
};
