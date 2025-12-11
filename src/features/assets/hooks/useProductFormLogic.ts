import { useMemo } from "react";
import type { Product, Category, Attribute } from "../interfaces/product";
import {
  calculateProductStatus,
  formatAttributesForSubmit,
  normalizeLocation,
} from "../utils/productTransformations";

interface UseProductFormLogicProps {
  selectedCategory: Category | undefined;
  enrichedFields?: Array<{ name: string }>;
  categoryComponents: Record<string, { fields: Array<{ name: string }> }>;
}

/**
 * Hook que contiene la lógica de negocio del formulario de productos
 */
export const useProductFormLogic = ({
  selectedCategory,
  enrichedFields,
  categoryComponents,
}: UseProductFormLogicProps) => {
  // Obtener la configuración de campos según la categoría
  const formConfig = useMemo(() => {
    if (enrichedFields) {
      return { fields: enrichedFields };
    }
    return categoryComponents[selectedCategory || ""] || { fields: [] };
  }, [enrichedFields, selectedCategory, categoryComponents]);

  /**
   * Prepara los datos del producto para envío
   */
  const prepareProductData = (
    formData: Partial<Product>,
    attributes: Array<{ key: string; value: string; _id?: string }> | undefined,
    amount: number | undefined,
    currentRecoverable: boolean,
    initialData?: Partial<Product>
  ): Product => {
    const normalizedLocation = normalizeLocation(formData.location);

    // Calcular status
    const status = calculateProductStatus(
      formData.productCondition,
      normalizedLocation,
      formData.assignedEmail
    );

    // Formatear atributos - usar attributes del form o initialData como fallback
    // Asegurar que todos los atributos tengan value como string requerido
    const attrsToFormat = (attributes || initialData?.attributes || []).map(
      (attr) => ({
        key: attr.key,
        value: attr.value || "",
        _id: attr._id,
      })
    );
    const formattedAttributes = formatAttributesForSubmit(
      attrsToFormat,
      formConfig.fields
    ) as Attribute[];

    // Preparar datos
    const productData: Product = {
      _id: formData._id || "",
      name: formData.name || "",
      category: selectedCategory || "Other",
      attributes: formattedAttributes,
      status,
      productCondition:
        formData.productCondition || formData.productCondition || "Optimal",
      deleted: false,
      recoverable: currentRecoverable,
      acquisitionDate: formData.acquisitionDate || "",
      createdAt: formData.createdAt || "",
      updatedAt: formData.updatedAt || "",
      deletedAt: formData.deletedAt || "",
      serialNumber: formData.serialNumber?.trim() || "",
      location: normalizedLocation,
      assignedEmail: formData.assignedEmail,
      assignedMember: formData.assignedMember,
      lastAssigned: formData.lastAssigned || "",
      price:
        amount !== undefined
          ? { amount, currencyCode: formData.price?.currencyCode || "USD" }
          : undefined,
      additionalInfo: formData.additionalInfo || "",
      fp_shipment: false,
      desirableDate: {
        origin: "",
        destination: "",
      },
      shipmentOrigin: "",
      shipmentDestination: "",
      shipmentId: "",
      origin: "",
      activeShipment: false,
    };

    // Si el modelo no es "Other", limpiar el nombre
    const model = formattedAttributes.find(
      (attr) => attr.key === "model"
    )?.value;
    if (model && model !== "Other") {
      productData.name = "";
    }

    // OfficeId solo si location es "Our office"
    if (normalizedLocation === "Our office") {
      productData.officeId = formData.officeId;
    } else {
      productData.officeId = undefined;
    }

    return productData;
  };

  return {
    formConfig,
    prepareProductData,
  };
};
