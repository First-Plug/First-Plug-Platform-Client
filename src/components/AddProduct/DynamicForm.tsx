"use client";
import React, { useEffect, useState } from "react";
import { DropdownInputProductForm } from "./DropDownProductForm";
import { InputProductForm } from "./InputProductForm";
import { useFormContext, Controller } from "react-hook-form";

const DynamicForm = ({
  fields,
  handleAttributesChange,
  isUpdate,
  initialValues,
  customErrors,
  setCustomErrors,
}) => {
  const {
    setValue,
    watch,
    control,
    formState: { errors },
    clearErrors,
  } = useFormContext();
  const [attributes, setAttributes] = useState(initialValues?.attributes || []);
  const selectedCategory = watch("category");

  useEffect(() => {
    const newAttributes = fields.map((field) => ({
      _id: "",
      key: field.name,
      value: watch(field.name) || "",
    }));
    setAttributes(newAttributes);
    handleAttributesChange(newAttributes);
  }, [fields, watch, handleAttributesChange]);

  useEffect(() => {
    if (isUpdate && initialValues) {
      fields.forEach((field) => {
        const value = initialValues.attributes.find(
          (attr) => attr.key === field.name
        )?.value;
        setValue(field.name, value);
      });
    }
  }, [isUpdate, initialValues, fields, setValue]);

  const handleChange = (fieldKey, value) => {
    const updatedAttributes = attributes.map((attr) =>
      attr.key === fieldKey ? { ...attr, value } : attr
    );
    setAttributes(updatedAttributes);
    handleAttributesChange(updatedAttributes);

    setValue(fieldKey, value);
    clearErrors(fieldKey);
    setCustomErrors((prev) => ({ ...prev, [fieldKey]: undefined }));
  };

  const getAttributeError = (key) => {
    return errors[key]?.message || customErrors[key] || null;
  };

  return (
    <div
      className={`grid gap-4 ${
        isUpdate ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 lg:grid-cols-3"
      }`}
    >
      {selectedCategory === "Merchandising" && (
        <div className="w-full">
          <InputProductForm
            name="name"
            type="text"
            value={watch("name") as string}
            onChange={(e) => {
              setValue("name", e.target.value);
              clearErrors("name");
            }}
            placeholder="Product Name"
            title="Product Name*"
          />
          <div className="min-h-[24px]">
            {errors.name && (
              <p className="text-red-500">{(errors.name as any)?.message}</p>
            )}
          </div>
        </div>
      )}
      {fields.map((field) => (
        <div key={field.name}>
          <Controller
            name={field.name}
            control={control}
            render={({ field: { onChange, value } }) => (
              <DropdownInputProductForm
                name={field.name}
                options={field.options}
                placeholder={field.title}
                title={field.title}
                selectedOption={value || ""}
                searchable={true}
                onChange={(option) => {
                  onChange(option);
                  handleChange(field.name, option);
                }}
                required={
                  selectedCategory !== "Merchandising" &&
                  ["brand", "model"].includes(field.name)
                    ? "required"
                    : undefined
                }
              />
            )}
          />
          <div className="min-h-[24px]">
            {getAttributeError(field.name) && (
              <p className="text-red-500">{getAttributeError(field.name)}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DynamicForm;
