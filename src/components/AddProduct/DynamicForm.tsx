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
    const watchedAttributes = watch("attributes") || [];

    const newAttributes = fields.map((field) => {
      const matchingAttribute = watchedAttributes.find(
        (attr) => attr.key === field.name
      );

      return {
        _id: matchingAttribute?._id || "",
        key: field.name,
        value: matchingAttribute?.value || "",
      };
    });

    setAttributes(newAttributes);
    handleAttributesChange(newAttributes);

    newAttributes.forEach((attr, index) => {
      setValue(`attributes.${index}.key`, attr.key);
      setValue(`attributes.${index}.value`, attr.value);
    });
  }, [fields, watch, handleAttributesChange, setValue]);

  const handleChange = (fieldKey, value) => {
    const updatedAttributes = attributes.map((attr) =>
      attr.key === fieldKey ? { ...attr, value } : attr
    );

    setAttributes(updatedAttributes);
    handleAttributesChange(updatedAttributes);

    if (isUpdate) {
      setValue(
        `attributes.${attributes.findIndex(
          (attr) => attr.key === fieldKey
        )}.value`,
        value
      );
    } else {
      setValue(fieldKey, value);
    }

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
      {fields.map((field, index) => (
        <div key={field.name}>
          <Controller
            name={`attributes.${index}.value`}
            control={control}
            defaultValue={
              attributes.find((attr) => attr.key === field.name)?.value || ""
            }
            render={({ field: { onChange, value } }) => (
              <DropdownInputProductForm
                name={field.name}
                options={field.options}
                placeholder={field.title}
                title={field.title}
                selectedOption={value}
                searchable={true}
                onChange={(option) => {
                  onChange(option); // Actualizamos el valor interno del formulario
                  handleChange(field.name, option); // Actualizamos `attributes`
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
