"use client";
import React, { useEffect, useState } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { DropdownInputProductForm } from "@/features/assets";

export const DynamicForm = ({
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
        (attr) => attr?.key === field.name
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
      if (attr && attr.key) {
        setValue(`attributes.${index}.key`, attr.key);
        setValue(`attributes.${index}.value`, attr.value);
      }
    });
  }, [fields, watch("attributes"), handleAttributesChange, setValue]);

  const handleChange = (fieldKey, value) => {
    if (!fieldKey) return;

    const updatedAttributes = attributes
      .map((attr) => (attr?.key === fieldKey ? { ...attr, value } : attr))
      .filter(Boolean);

    setAttributes(updatedAttributes);
    handleAttributesChange(updatedAttributes);

    const attributeIndex = updatedAttributes.findIndex(
      (attr) => attr?.key === fieldKey
    );

    if (attributeIndex !== -1) {
      setValue(`attributes.${attributeIndex}.value`, value);
    }

    clearErrors(fieldKey);
    setCustomErrors((prev) => ({ ...prev, [fieldKey]: undefined }));
  };

  const getAttributeError = (key) => {
    return errors[key]?.message || customErrors[key] || null;
  };

  const getFieldConfig = (fieldName: string, fieldTitle: string) => {
    const config: {
      title: string;
      placeholder: string;
      allowCustomInput: boolean;
      inputType: "text" | "numbers" | "letters";
    } = {
      title: "",
      placeholder: "",
      allowCustomInput: false,
      inputType: "text",
    };

    // Campos que permiten input personalizado
    const customInputFields = [
      "brand",
      "model",
      "processor",
      "ram",
      "screen",
      "color",
      "keyboardLanguage",
      "gpu",
    ];

    if (customInputFields.includes(fieldName)) {
      config.allowCustomInput = true;

      // Títulos especiales
      if (fieldName === "ram") {
        config.title = "RAM (GB)";
        config.placeholder = "Select or write the RAM (GB)";
      } else if (fieldName === "screen") {
        config.title = "Screen (inches)";
        config.placeholder = "Select or write the Screen (inches)";
      } else {
        // Usar el título del campo sin el asterisco si existe
        const cleanTitle = fieldTitle.replace(/\*/g, "").trim();
        config.placeholder = `Select or write the ${cleanTitle}`;
      }

      // Validaciones por tipo de input
      if (fieldName === "ram" || fieldName === "screen") {
        config.inputType = "numbers";
      } else if (fieldName === "color" || fieldName === "keyboardLanguage") {
        config.inputType = "letters";
      }
    }

    return config;
  };

  return (
    <div
      className={`grid gap-4 ${
        isUpdate ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 lg:grid-cols-3"
      }`}
    >
      {fields.map((field, index) => {
        const fieldConfig = getFieldConfig(field.name, field.title);
        const displayTitle = fieldConfig.title || field.title;
        // Usar placeholder personalizado si está configurado, sino usar el título del campo
        const displayPlaceholder = fieldConfig.placeholder || field.title;

        return (
          <div key={field.name}>
            <Controller
              name={`attributes.${index}.value`}
              control={control}
              defaultValue={
                attributes.find((attr) => attr.key === field.name)?.value || ""
              }
              render={({ field: { onChange, value } }) => {
                return (
                  <DropdownInputProductForm
                    name={field.name}
                    options={field.options}
                    placeholder={displayPlaceholder}
                    title={displayTitle}
                    selectedOption={value}
                    searchable={true}
                    allowCustomInput={fieldConfig.allowCustomInput}
                    inputType={fieldConfig.inputType}
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
                );
              }}
            />
            <div className="min-h-[24px]">
              {getAttributeError(field.name) && (
                <p className="text-red-500">{getAttributeError(field.name)}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
