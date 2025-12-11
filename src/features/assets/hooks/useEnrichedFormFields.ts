"use client";

import { useMemo } from "react";
import { useGetTableAssets } from "./useGetTableAssets";
import { type ProductTable, type Category } from "../interfaces/product";

import computerData from "../components/JSON/computerform.json";
import audioData from "../components/JSON/audioform.json";
import monitorData from "../components/JSON/monitorform.json";
import peripheralsData from "../components/JSON/peripheralsform.json";
import othersData from "../components/JSON/othersform.json";
import merchandisingData from "../components/JSON/merchandisingform.json";

const categoryComponents = {
  Audio: audioData,
  Computer: computerData,
  Merchandising: merchandisingData,
  Monitor: monitorData,
  Peripherals: peripheralsData,
  Other: othersData,
};

/**
 * Hook que enriquece los campos del formulario con valores reales de productos.
 * Combina las opciones estáticas de los JSON con los valores únicos extraídos
 * de los productos existentes en la base de datos.
 */
export const useEnrichedFormFields = (category: Category | undefined) => {
  const { data: assets, isLoading, isFetching } = useGetTableAssets();

  const enrichedFields = useMemo(() => {
    if (!category) {
      return null;
    }

    const staticConfig = categoryComponents[category];
    if (!staticConfig) {
      return null;
    }

    // Extraer valores únicos de atributos de productos por categoría
    const attributeValuesMap: Record<string, Set<string>> = {};

    if (assets && assets.length > 0) {
      assets.forEach((asset: ProductTable) => {
        if (asset.category === category && asset.products) {
          asset.products.forEach((product) => {
            if (product.attributes) {
              product.attributes.forEach((attr) => {
                if (attr.key && attr.value && attr.value.trim() !== "") {
                  // Para RAM, quitar "GB" para normalizar
                  let normalizedValue = attr.value.trim();
                  if (attr.key === "ram") {
                    normalizedValue = normalizedValue
                      .toLowerCase()
                      .endsWith("gb")
                      ? normalizedValue.slice(0, -2).trim()
                      : normalizedValue;
                  }

                  if (!attributeValuesMap[attr.key]) {
                    attributeValuesMap[attr.key] = new Set<string>();
                  }
                  attributeValuesMap[attr.key].add(normalizedValue);
                }
              });
            }
          });
        }
      });
    }

    // Función helper para normalizar valores de RAM (quitar "GB")
    const normalizeRamValue = (value: string): string => {
      if (typeof value === "string" && value.toLowerCase().endsWith("gb")) {
        return value.slice(0, -2).trim();
      }
      return value.trim();
    };

    // Función para ordenar opciones: numéricamente si son números, alfabéticamente si son palabras
    const smartSort = (a: string, b: string): number => {
      // Verificar si un string es principalmente numérico (solo números o números con unidades como GB)
      const isPrimarilyNumeric = (str: string): boolean => {
        // Eliminar espacios y convertir a minúsculas
        const cleaned = str.trim().toLowerCase();
        // Verificar si es solo números o números seguidos de letras comunes (gb, tb, etc.)
        return /^\d+[a-z]*$/.test(cleaned) && cleaned.length <= 10;
      };

      const aIsNumeric = isPrimarilyNumeric(a);
      const bIsNumeric = isPrimarilyNumeric(b);

      // Si ambos son principalmente numéricos, ordenar numéricamente
      if (aIsNumeric && bIsNumeric) {
        const extractNumber = (str: string): number => {
          const match = str.match(/\d+/);
          return match ? parseFloat(match[0]) : 0;
        };
        const numA = extractNumber(a);
        const numB = extractNumber(b);
        if (numA !== numB) {
          return numA - numB;
        }
        // Si los números son iguales, ordenar alfabéticamente
        return a.localeCompare(b);
      }

      // Si solo uno es numérico, el numérico va primero
      if (aIsNumeric && !bIsNumeric) return -1;
      if (!aIsNumeric && bIsNumeric) return 1;

      // Si ninguno es principalmente numérico, ordenar alfabéticamente
      return a.localeCompare(b);
    };

    // Combinar opciones estáticas con valores dinámicos
    const enrichedFields = staticConfig.fields.map((field) => {
      const staticOptions = field.options || [];
      const dynamicValues = Array.from(attributeValuesMap[field.name] || []);

      // Para RAM, normalizar ambos lados para comparar correctamente
      if (field.name === "ram") {
        // Normalizar opciones estáticas para comparación
        const normalizedStaticSet = new Set<string>();
        const staticOptionsMap = new Map<string, string>(); // normalizado -> original

        staticOptions.forEach((opt) => {
          const normalized = normalizeRamValue(opt);
          normalizedStaticSet.add(normalized);
          // Mantener el formato original sin "GB" para consistencia
          if (!staticOptionsMap.has(normalized)) {
            staticOptionsMap.set(normalized, normalized);
          }
        });

        // Separar valores dinámicos: los que NO están en estáticas
        const uniqueDynamicValues: string[] = [];
        dynamicValues.forEach((val) => {
          const normalized = normalizeRamValue(val);
          if (!normalizedStaticSet.has(normalized)) {
            uniqueDynamicValues.push(normalized);
          }
        });

        // Obtener opciones estáticas normalizadas
        const normalizedStaticOptions = Array.from(staticOptionsMap.values());

        // Combinar todas las opciones (dinámicas únicas + estáticas) y ordenar juntas
        const allOptions = [...uniqueDynamicValues, ...normalizedStaticOptions];
        const combinedOptions = allOptions.sort(smartSort);

        return {
          ...field,
          options: combinedOptions,
        };
      }

      // Para otros campos
      // Crear un Set de opciones estáticas para comparación rápida
      const staticSet = new Set(staticOptions);

      // Separar valores dinámicos: los que NO están en estáticas
      const uniqueDynamicValues = dynamicValues.filter(
        (val) => !staticSet.has(val)
      );

      // Para Storage, mantener el orden original sin ordenar
      if (field.name === "storage") {
        // Mantener el orden original: primero las estáticas, luego las dinámicas
        const combinedOptions = [...staticOptions, ...uniqueDynamicValues];
        return {
          ...field,
          options: combinedOptions,
        };
      }

      // Para otros campos, ordenar con smartSort
      const allOptions = [...uniqueDynamicValues, ...staticOptions];
      const combinedOptions = allOptions.sort(smartSort);

      return {
        ...field,
        options: combinedOptions,
      };
    });

    return enrichedFields;
  }, [category, assets]);

  // Retornar también el estado de loading
  const isLoadingFields = isLoading || isFetching;

  return {
    fields: enrichedFields,
    isLoading: isLoadingFields,
  };
};
