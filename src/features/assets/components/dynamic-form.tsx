"use client";
import React, { useMemo, useEffect, useRef } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { DropdownInputProductForm } from "@/features/assets";

export const DynamicForm = ({
  fields,
  handleAttributesChange,
  isUpdate,
  initialValues,
  customErrors,
  setCustomErrors,
  attributes, // Recibir attributes como prop desde ProductForm
}) => {
  const {
    setValue,
    control,
    formState: { errors },
    clearErrors,
  } = useFormContext();

  // Helper para quitar "GB" del valor de RAM para mostrar
  const removeGBFromRam = (value: string): string => {
    if (typeof value === "string" && value.toLowerCase().endsWith("gb")) {
      return value.slice(0, -2).trim();
    }
    return value;
  };

  // Procesar valores iniciales para quitar "GB" de RAM
  const processedInitialAttributes = useMemo(
    () =>
      (initialValues?.attributes || []).map((attr) => {
        if (attr.key === "ram" && attr.value) {
          return { ...attr, value: removeGBFromRam(attr.value) };
        }
        return attr;
      }),
    [initialValues?.attributes]
  );

  // Inicializar solo una vez al montar
  useEffect(() => {
    // Sincronizar con react-hook-form al montar
    attributes.forEach((attr, index) => {
      if (attr && attr.key) {
        setValue(`attributes.${index}.key`, attr.key, {
          shouldValidate: false,
        });
        setValue(`attributes.${index}.value`, attr.value, {
          shouldValidate: false,
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ref para prevenir actualizaciones circulares
  const isUpdatingFromUserRef = useRef(false);

  const handleChange = (
    fieldKey: string,
    value: string,
    fieldIndex: number
  ) => {
    if (!fieldKey) return;

    // Prevenir actualizaciones circulares
    if (isUpdatingFromUserRef.current) {
      return;
    }

    // Si es RAM, quitar "GB" del valor para almacenar sin "GB"
    let processedValue = value;
    if (fieldKey === "ram") {
      processedValue = removeGBFromRam(value);
    }

    // Marcar que estamos actualizando desde el usuario
    isUpdatingFromUserRef.current = true;

    // Usar función de actualización para asegurar que siempre use el estado más reciente
    // Esto evita problemas de closure cuando hay múltiples actualizaciones rápidas
    handleAttributesChange((prevAttributes) => {
      const existingAttrIndex = prevAttributes.findIndex(
        (attr) => attr.key === fieldKey
      );

      if (existingAttrIndex !== -1) {
        return prevAttributes.map((attr) =>
          attr.key === fieldKey ? { ...attr, value: processedValue } : attr
        );
      } else {
        return [
          ...prevAttributes,
          {
            _id: "",
            key: fieldKey,
            value: processedValue,
          },
        ];
      }
    });

    // Resetear el flag después de un breve delay
    setTimeout(() => {
      isUpdatingFromUserRef.current = false;
    }, 100);

    // Sincronizar con react-hook-form
    setValue(`attributes.${fieldIndex}.key`, fieldKey, {
      shouldValidate: false,
      shouldDirty: true,
    });
    setValue(`attributes.${fieldIndex}.value`, processedValue, {
      shouldValidate: false,
      shouldDirty: true,
    });

    clearErrors(fieldKey);
    setCustomErrors((prev) => ({ ...prev, [fieldKey]: undefined }));
  };

  const getAttributeError = (key: string) => {
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

      if (fieldName === "ram") {
        config.title = "RAM (GB)";
        config.placeholder = "Select or write the RAM";
      } else if (fieldName === "screen") {
        config.title = "Screen (inches)";
        config.placeholder = "Select or write the Screen (inches)";
      } else {
        const cleanTitle = fieldTitle.replace(/\*/g, "").trim();
        config.placeholder = `Select or write the ${cleanTitle}`;
      }

      if (fieldName === "ram" || fieldName === "screen") {
        config.inputType = "numbers";
      } else if (fieldName === "color" || fieldName === "keyboardLanguage") {
        config.inputType = "letters";
      }
    }

    return config;
  };

  const selectedCategory = useFormContext().watch("category");

  return (
    <div
      className={`grid gap-4 ${
        isUpdate ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 lg:grid-cols-3"
      }`}
    >
      {fields.map((field, index) => {
        const fieldConfig = getFieldConfig(field.name, field.title);
        const displayTitle = fieldConfig.title || field.title;
        const displayPlaceholder = fieldConfig.placeholder || field.title;

        // Procesar opciones de RAM para quitar "GB" visualmente
        const processedOptions =
          field.name === "ram"
            ? field.options?.map((opt) => {
                if (
                  typeof opt === "string" &&
                  opt.toLowerCase().endsWith("gb")
                ) {
                  return opt.slice(0, -2).trim();
                }
                return opt;
              })
            : field.options;

        // Obtener el valor de los attributes recibidos como prop
        const attr = attributes.find((a) => a.key === field.name);
        const attrValue = attr?.value || "";
        const displayValue =
          field.name === "ram" ? removeGBFromRam(attrValue) : attrValue;

        return (
          <div key={field.name}>
            <Controller
              name={`attributes.${index}.value`}
              control={control}
              defaultValue={displayValue}
              render={({ field: { onChange } }) => {
                return (
                  <DropdownInputProductForm
                    name={field.name}
                    options={processedOptions}
                    placeholder={displayPlaceholder}
                    title={displayTitle}
                    selectedOption={displayValue}
                    searchable={true}
                    allowCustomInput={fieldConfig.allowCustomInput}
                    inputType={fieldConfig.inputType}
                    onChange={(option) => {
                      // Si ya estamos actualizando desde el usuario, ignorar esta llamada
                      if (isUpdatingFromUserRef.current) {
                        return;
                      }

                      // IMPORTANTE: Actualizar el estado único en ProductForm PRIMERO
                      // Esto asegura que el estado se actualice antes de sincronizar con react-hook-form
                      handleChange(field.name, option, index);

                      // NO sincronizar con react-hook-form aquí
                      // El Controller puede causar re-renders que sobrescriben nuestros cambios
                      // En su lugar, solo actualizamos nuestro estado único
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
