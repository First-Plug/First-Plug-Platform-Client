"use client";
import React, { useState, useMemo, useEffect, useRef } from "react";
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

  // Función para inicializar atributos desde fields y initialValues
  const initializeAttributes = useMemo(() => {
    return fields.map((field) => {
      const matchingAttribute = processedInitialAttributes.find(
        (attr) => attr?.key === field.name
      );
      return {
        _id: matchingAttribute?._id || "",
        key: field.name,
        value: matchingAttribute?.value || "",
      };
    });
  }, [fields, processedInitialAttributes]);

  // Estado local como fuente de verdad única
  const [attributes, setAttributes] = useState(initializeAttributes);

  // Referencia para rastrear si ya se inicializó
  const isInitializedRef = useRef(false);
  const lastInitialValuesRef = useRef(
    JSON.stringify(processedInitialAttributes)
  );

  // Sincronizar solo cuando cambian los valores iniciales externamente (no por cambios del usuario)
  useEffect(() => {
    const currentInitialValues = JSON.stringify(processedInitialAttributes);

    // Solo sincronizar si:
    // 1. Es la primera vez que se monta el componente, O
    // 2. Los valores iniciales cambiaron externamente (no por cambios del usuario)
    if (
      !isInitializedRef.current ||
      lastInitialValuesRef.current !== currentInitialValues
    ) {
      // Actualizar el estado local
      setAttributes(initializeAttributes);

      // Sincronizar con el formulario
      initializeAttributes.forEach((attr, index) => {
        if (attr && attr.key) {
          setValue(`attributes.${index}.key`, attr.key, {
            shouldValidate: false,
          });
          setValue(`attributes.${index}.value`, attr.value, {
            shouldValidate: false,
          });
        }
      });

      // Sincronizar con product-form (estado padre)
      handleAttributesChange(initializeAttributes);

      // Marcar como inicializado y guardar referencia
      isInitializedRef.current = true;
      lastInitialValuesRef.current = currentInitialValues;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initializeAttributes, fields.length]);

  const handleChange = (
    fieldKey: string,
    value: string,
    fieldIndex: number
  ) => {
    if (!fieldKey) return;

    // Si es RAM, quitar "GB" del valor para almacenar sin "GB"
    let processedValue = value;
    if (fieldKey === "ram") {
      processedValue = removeGBFromRam(value);
    }

    // Actualizar el estado local (fuente de verdad)
    // Buscar si el atributo ya existe
    const existingAttrIndex = attributes.findIndex(
      (attr) => attr.key === fieldKey
    );

    let updatedAttributes;
    if (existingAttrIndex !== -1) {
      // Actualizar el atributo existente
      updatedAttributes = attributes.map((attr) =>
        attr.key === fieldKey ? { ...attr, value: processedValue } : attr
      );
    } else {
      // Agregar el nuevo atributo si no existe
      updatedAttributes = [
        ...attributes,
        {
          _id: "",
          key: fieldKey,
          value: processedValue,
        },
      ];
    }

    // Actualizar el estado local primero
    setAttributes(updatedAttributes);

    // IMPORTANTE: Actualizar el estado en product-form INMEDIATAMENTE
    // Esto debe ser síncrono para que esté disponible al guardar
    handleAttributesChange(updatedAttributes);

    // Sincronizar con el formulario de react-hook-form
    setValue(`attributes.${fieldIndex}.key`, fieldKey, {
      shouldValidate: false,
    });
    setValue(`attributes.${fieldIndex}.value`, processedValue, {
      shouldValidate: false,
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

        // Obtener el valor del estado local
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
                      // IMPORTANTE: Actualizar el estado local PRIMERO (fuente de verdad)
                      // Esto debe ejecutarse de forma síncrona antes de cualquier otra cosa
                      handleChange(field.name, option, index);
                      // Luego sincronizar con el Controller del formulario
                      onChange(option);
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
