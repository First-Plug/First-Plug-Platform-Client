import type {
  QuoteProduct,
  QuoteService,
  QuoteRequestPayload,
  StorageDetail,
} from "../types/quote.types";
import { COUNTRY_TO_ISO } from "./constants";
import { normalizeCountryCode } from "@/shared/utils/countryCodeNormalizer";

/**
 * Convierte un nombre de país a su código ISO de 2 letras
 * @param countryName - Nombre del país o código ISO existente
 * @returns Código ISO de 2 letras
 */
export function getCountryISO(countryName: string): string {
  if (countryName.length === 2 && /^[A-Z]{2}$/i.test(countryName)) {
    return countryName.toUpperCase();
  }

  const iso = COUNTRY_TO_ISO[countryName];
  if (iso) {
    return iso;
  }

  return countryName.substring(0, 2).toUpperCase();
}

/**
 * Elimina campos undefined y null de un objeto
 * @param obj - Objeto a limpiar
 * @returns Objeto sin campos undefined o null
 */
export function removeUndefinedFields<T extends Record<string, any>>(
  obj: T
): Partial<T> {
  const cleaned: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null) {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

/**
 * Mapea el sistema operativo a su formato estándar
 * @param os - Sistema operativo en formato lowercase
 * @returns Sistema operativo en formato estándar o undefined
 */
function mapOS(os?: string): string | undefined {
  if (!os) return undefined;
  const osMap: Record<string, string> = {
    macos: "macOS",
    windows: "Windows",
    linux: "Linux",
  };
  return osMap[os.toLowerCase()] || os;
}

/**
 * Transforma un producto de QuoteProduct al formato esperado por el backend
 * @param product - Producto en formato QuoteProduct
 * @returns Producto transformado en formato del backend
 * @throws Error si hay problemas con la fecha, cantidad o garantía extendida
 */
export function transformProductToBackendFormat(
  product: QuoteProduct
): QuoteRequestPayload["products"][0] {
  let deliveryDate: string | undefined;
  if (product.requiredDeliveryDate) {
    const dateStr = product.requiredDeliveryDate;
    // Extraer solo la fecha en formato YYYY-MM-DD (sin tiempo)
    // Si viene en formato ISO con tiempo, extraer solo la parte de la fecha
    const dateOnly = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
    // Validar que sea un formato de fecha válido (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateOnly)) {
      throw new Error(`Invalid date format: ${dateStr}. Expected YYYY-MM-DD`);
    }
    deliveryDate = dateOnly;
  }

  const quantity =
    typeof product.quantity === "number"
      ? Math.floor(Math.abs(product.quantity))
      : Math.floor(Math.abs(parseInt(String(product.quantity || 1), 10)));

  if (quantity < 1) {
    throw new Error("quantity must be a positive integer");
  }

  const category = product.category
    ? product.category.charAt(0).toUpperCase() +
      product.category.slice(1).toLowerCase()
    : "";

  const countryISO = product.country ? getCountryISO(product.country) : "";

  const transformed: any = {
    category: category,
    quantity: quantity,
    country: countryISO,
  };

  if (product.operatingSystem) {
    const mappedOS = mapOS(product.operatingSystem);
    if (mappedOS) {
      transformed.os = mappedOS;
    }
  }

  if (product.brands && product.brands.length > 0) {
    transformed.brand = product.brands;
  }

  if (product.models && product.models.length > 0) {
    transformed.model = product.models;
  }

  if (product.processors && product.processors.length > 0) {
    transformed.processor = product.processors;
  }

  if (product.ram && product.ram.length > 0) {
    transformed.ram = product.ram;
  }

  if (product.storage && product.storage.length > 0) {
    transformed.storage = product.storage;
  }

  if (product.screenSize && product.screenSize.length > 0) {
    transformed.screenSize = product.screenSize;
  }

  if (product.screenTechnology && product.screenTechnology.length > 0) {
    transformed.screenTechnology = product.screenTechnology;
  }

  if (product.otherSpecifications) {
    transformed.otherSpecifications = product.otherSpecifications;
  }

  if (product.description) {
    transformed.description = product.description;
  }

  if (product.additionalRequirements) {
    transformed.additionalRequirements = product.additionalRequirements;
  }

  if (product.furnitureType && product.furnitureType.length > 0) {
    transformed.furnitureType = product.furnitureType;
  }

  if (product.extendedWarranty?.enabled !== undefined) {
    transformed.extendedWarranty = Boolean(product.extendedWarranty.enabled);

    if (product.extendedWarranty.enabled) {
      if (!product.extendedWarranty.extraYears) {
        throw new Error(
          "extendedWarrantyYears is required when extendedWarranty is true"
        );
      }
      transformed.extendedWarrantyYears = product.extendedWarranty.extraYears;
    }
  }

  if (product.deviceEnrollment !== undefined) {
    transformed.deviceEnrollment = Boolean(product.deviceEnrollment);
  }

  if (product.city) {
    transformed.city = product.city;
  }

  if (deliveryDate) {
    transformed.deliveryDate = deliveryDate;
  }

  if (product.additionalComments) {
    transformed.comments = product.additionalComments;
  }

  return removeUndefinedFields(
    transformed
  ) as QuoteRequestPayload["products"][0];
}

/**
 * Mapea los IDs de issue types a sus labels
 */
const issueTypesMap: Record<string, string> = {
  "software-issue": "Software issue",
  "connectivity-network": "Connectivity / network",
  "account-access": "Account / access issue",
  performance: "Performance issues",
  "damage-accident": "Damage / accident",
  other: "Other",
};

/**
 * Mapea el serviceType a serviceCategory
 */
function mapServiceTypeToCategory(serviceType?: string): string {
  if (!serviceType) return "";
  const serviceTypeMap: Record<string, string> = {
    "it-support": "IT Support",
    enrollment: "Enrollment",
    buyback: "Buyback",
    "data-wipe": "Data Wipe",
    cleaning: "Cleaning",
    donations: "Donate",
    storage: "Storage",
    "destruction-recycling": "Destruction and Recycling",
    logistics: "Logistics",
    offboarding: "Offboarding",
  };
  return serviceTypeMap[serviceType] || serviceType;
}

/**
 * Valida y muestra en consola todos los assets que no tienen countryCode
 * @param assets - Array de assets a validar
 * @param membersMap - Map opcional de email -> member
 */
export function validateAssetsCountryCode(
  assets: any[],
  membersMap?: Map<string, any>
): void {
  const assetsWithoutCountryCode: Array<{
    asset: any;
    location: string;
    assignedTo: string;
    availableFields: any;
    suggestions: string[];
  }> = [];

  assets.forEach((asset) => {
    let rawCountryCode: string | null = null;
    let location = "";
    let assignedTo = "";
    const suggestions: string[] = [];

    // Determinar location y assignedTo
    if (asset.assignedMember || asset.assignedEmail) {
      location = asset.location || "";
      assignedTo = asset.assignedMember || asset.assignedEmail || "";

      // Intentar obtener countryCode del member
      const memberEmail = asset.assignedEmail || asset.assignedMember;
      if (memberEmail && membersMap) {
        const member = membersMap.get(memberEmail.toLowerCase());
        if (member?.country && member.country.trim() !== "") {
          rawCountryCode = member.country;
        } else {
          suggestions.push(
            `Member "${memberEmail}" ${
              member ? "exists but has no country" : "not found in membersMap"
            }`
          );
        }
      }
      if (!rawCountryCode) {
        rawCountryCode = asset.countryCode || asset.country || null;
        if (!rawCountryCode) {
          suggestions.push("Asset has no countryCode or country field");
        }
      }
    } else if (asset.location === "Our office") {
      location = "Our office";
      assignedTo = asset.office?.officeName || asset.officeName || "";
      rawCountryCode =
        asset.office?.officeCountryCode ||
        asset.countryCode ||
        asset.country ||
        null;

      if (!rawCountryCode) {
        suggestions.push("Office has no officeCountryCode");
        if (asset.office) {
          suggestions.push(
            `Office object available: ${JSON.stringify(asset.office)}`
          );
        } else {
          suggestions.push("No office object found on asset");
        }
      }
    } else if (asset.location === "FP warehouse") {
      location = "FP warehouse";
      assignedTo = asset.officeName || asset.office?.officeName || "";
      rawCountryCode =
        asset.fpWarehouse?.warehouseCountryCode ||
        asset.countryCode ||
        asset.country ||
        null;

      if (!rawCountryCode) {
        suggestions.push("FP warehouse has no warehouseCountryCode");
        if (asset.fpWarehouse) {
          suggestions.push(
            `FP Warehouse object available: ${JSON.stringify(
              asset.fpWarehouse
            )}`
          );
        } else {
          suggestions.push("No fpWarehouse object found on asset");
        }
      }
    } else {
      location = asset.location || "";
      rawCountryCode =
        asset.office?.officeCountryCode ||
        asset.fpWarehouse?.warehouseCountryCode ||
        asset.countryCode ||
        asset.country ||
        null;
    }

    const countryCode = normalizeCountryCode(rawCountryCode);

    if (!countryCode || countryCode.trim() === "") {
      const availableFields: any = {
        assetId: asset._id,
        name: asset.name,
        location: asset.location,
        countryCode: asset.countryCode,
        country: asset.country,
        assignedEmail: asset.assignedEmail,
        assignedMember: asset.assignedMember,
        office: asset.office
          ? {
              officeId: asset.office.officeId,
              officeName: asset.office.officeName,
              officeCountryCode: asset.office.officeCountryCode,
            }
          : null,
        fpWarehouse: asset.fpWarehouse
          ? {
              warehouseId: asset.fpWarehouse.warehouseId,
              warehouseName: asset.fpWarehouse.warehouseName,
              warehouseCountryCode: asset.fpWarehouse.warehouseCountryCode,
            }
          : null,
      };

      assetsWithoutCountryCode.push({
        asset,
        location,
        assignedTo,
        availableFields,
        suggestions,
      });
    }
  });

  if (assetsWithoutCountryCode.length > 0) {
    console.group("🔴 Assets sin countryCode encontrados:");
    console.log(
      `Total de assets sin countryCode: ${assetsWithoutCountryCode.length} de ${assets.length}`
    );
    console.log("");

    assetsWithoutCountryCode.forEach((item, index) => {
      console.group(`Asset ${index + 1}: ${item.asset.name || item.asset._id}`);
      console.log("📍 Location:", item.location);
      console.log("👤 Assigned To:", item.assignedTo || "N/A");
      console.log("📋 Campos disponibles:", item.availableFields);
      if (item.suggestions.length > 0) {
        console.log("💡 Sugerencias:");
        item.suggestions.forEach((suggestion) => {
          console.log(`   - ${suggestion}`);
        });
      }
      console.log("📦 Asset completo:", item.asset);
      console.groupEnd();
      console.log("");
    });

    // Mostrar ejemplos de members que SÍ tienen country
    if (membersMap && membersMap.size > 0) {
      const membersWithCountry = Array.from(membersMap.values())
        .filter(
          (member: any) => member?.country && member.country.trim() !== ""
        )
        .slice(0, 5); // Mostrar máximo 5 ejemplos

      if (membersWithCountry.length > 0) {
        console.group(
          "✅ Ejemplos de Members que SÍ tienen country configurado:"
        );
        membersWithCountry.forEach((member: any, index: number) => {
          console.log(`Member ${index + 1}:`, {
            email: member.email,
            fullName:
              member.fullName || `${member.firstName} ${member.lastName}`,
            country: member.country,
            // Mostrar solo los campos relevantes
            _id: member._id,
          });
        });
        console.groupEnd();
      } else {
        console.log(
          "⚠️ No se encontraron members con country configurado en el membersMap"
        );
      }
    }

    console.groupEnd();
  } else {
    console.log("✅ Todos los assets tienen countryCode válido");

    // Aún así mostrar ejemplos de members con country si están disponibles
    if (membersMap && membersMap.size > 0) {
      const membersWithCountry = Array.from(membersMap.values())
        .filter(
          (member: any) => member?.country && member.country.trim() !== ""
        )
        .slice(0, 3);

      if (membersWithCountry.length > 0) {
        console.log(
          "📋 Ejemplos de Members con country:",
          membersWithCountry.map((m: any) => ({
            email: m.email,
            fullName: m.fullName || `${m.firstName} ${m.lastName}`,
            country: m.country,
          }))
        );
      }
    }
  }
}

/**
 * Construye el snapshot de un asset para enrolledDevices
 */
function buildEnrolledDeviceFromAsset(
  asset: any,
  membersMap?: Map<string, any>
): {
  category: string;
  name: string;
  brand: string;
  model: string;
  serialNumber: string;
  location: string;
  assignedTo: string;
  countryCode: string;
} {
  const brand =
    asset.attributes?.find(
      (attr: any) =>
        attr.key === "Brand" ||
        attr.key === "brand" ||
        String(attr.key).toLowerCase() === "brand"
    )?.value || "";
  const model =
    asset.attributes?.find(
      (attr: any) =>
        attr.key === "Model" ||
        attr.key === "model" ||
        String(attr.key).toLowerCase() === "model"
    )?.value || "";

  // Determinar location y assignedTo según el formato esperado
  let location = "";
  let assignedTo = "";

  if (asset.assignedMember || asset.assignedEmail) {
    // Si está asignado a un empleado
    location = asset.location || "";
    assignedTo = asset.assignedMember || asset.assignedEmail || "";
  } else if (asset.location === "Our office") {
    // Para "Our office", location debe ser "Our office" y assignedTo el nombre de la oficina
    location = "Our office";
    assignedTo = asset.office?.officeName || asset.officeName || "";
  } else if (asset.location === "FP warehouse") {
    // Para "FP warehouse", location debe ser "FP warehouse" y assignedTo puede ser el nombre de la sede/warehouse
    location = "FP warehouse";
    // Buscar si hay información de warehouse o sede en el asset
    assignedTo = asset.officeName || asset.office?.officeName || "";
  } else if (asset.location) {
    location = asset.location;
    assignedTo = "";
  }

  // Obtener countryCode según el tipo de location
  let rawCountryCode: string | null = null;

  if (asset.assignedMember || asset.assignedEmail) {
    // CASO 1: Employee (Member) - El countryCode debe venir del member
    const memberEmail = asset.assignedEmail || asset.assignedMember;
    if (memberEmail && membersMap) {
      const member = membersMap.get(memberEmail.toLowerCase());
      if (member?.country && member.country.trim() !== "") {
        rawCountryCode = member.country;
      }
    }
    // Fallback: intentar del asset directamente si no se encontró en el member
    if (!rawCountryCode) {
      rawCountryCode = asset.countryCode || asset.country || null;
    }
  } else if (asset.location === "Our office") {
    // CASO 2: Our office - El countryCode debe venir de la oficina
    rawCountryCode =
      asset.office?.officeCountryCode ||
      asset.countryCode ||
      asset.country ||
      null;
  } else if (asset.location === "FP warehouse") {
    // CASO 3: FP warehouse - El countryCode puede venir del fpWarehouse o del asset
    rawCountryCode =
      asset.fpWarehouse?.warehouseCountryCode ||
      asset.countryCode ||
      asset.country ||
      null;
  } else {
    // CASO 4: Otros casos - Intentar todas las fuentes posibles
    rawCountryCode =
      asset.office?.officeCountryCode ||
      asset.fpWarehouse?.warehouseCountryCode ||
      asset.countryCode ||
      asset.country ||
      null;
  }

  // Normalizar el countryCode usando la función existente
  const countryCode = normalizeCountryCode(rawCountryCode);

  // Si después de todos los intentos no hay countryCode, lanzar error descriptivo
  if (!countryCode || countryCode.trim() === "") {
    let errorMessage = `Enrolled device countryCode is required but not found. `;
    errorMessage += `Asset ID: ${asset._id}, `;
    errorMessage += `Name: ${asset.name || "N/A"}, `;
    errorMessage += `Location: ${asset.location || "N/A"}`;

    if (asset.assignedMember || asset.assignedEmail) {
      // Error para Employee
      const memberEmail = asset.assignedEmail || asset.assignedMember;
      const member = memberEmail
        ? membersMap?.get(memberEmail.toLowerCase())
        : null;
      if (member) {
        errorMessage += `, Assigned Email: ${memberEmail}. The assigned member exists but does not have a country configured. Please update the member's country in the members section.`;
      } else {
        errorMessage += `, Assigned Email: ${
          memberEmail || "N/A"
        }. The assigned member was not found in the system or does not have a country.`;
      }
    } else if (asset.location === "Our office") {
      // Error para Our office
      errorMessage += `, Office: ${
        asset.office?.officeName || asset.officeName || "N/A"
      }. Please ensure the office has an officeCountryCode set.`;
    } else if (asset.location === "FP warehouse") {
      // Error para FP warehouse
      errorMessage += `. Please ensure the asset has a countryCode, or the fpWarehouse has a warehouseCountryCode set.`;
    } else {
      // Error genérico
      errorMessage += `. Please ensure the asset has a country code, office country code, warehouse country code, or country set.`;
    }

    throw new Error(errorMessage);
  }

  return {
    category: asset.category || "Computer",
    name: asset.name || "",
    brand: brand || "",
    model: model || "",
    serialNumber: asset.serialNumber || "",
    location: location || "",
    assignedTo: assignedTo || "",
    countryCode: countryCode,
  };
}

/**
 * Transforma un servicio de QuoteService al formato esperado por el backend
 * @param service - Servicio en formato QuoteService
 * @param asset - Asset opcional con la información del producto (para IT Support)
 * @param assetsMap - Map opcional de assetId -> asset (para Enrollment)
 * @param membersMap - Map opcional de email -> member (para obtener countryCode de empleados)
 * @param membersMapById - Map opcional de memberId -> member (para Offboarding originMember)
 * @returns Servicio transformado en formato del backend
 * @throws Error si hay problemas con la fecha o datos requeridos
 */
export function transformServiceToBackendFormat(
  service: QuoteService,
  asset?: any, // Product type from assets (para IT Support)
  assetsMap?: Map<string, any>, // Map de assetId -> asset (para Enrollment)
  membersMap?: Map<string, any>, // Map de email -> member (para obtener countryCode)
  membersMapById?: Map<string, any> // Map de memberId -> member (para Offboarding)
): NonNullable<QuoteRequestPayload["services"]>[0] {
  let issueStartDate: string | undefined;
  if (service.issueStartDate) {
    const dateStr = service.issueStartDate;
    // Extraer solo la fecha en formato YYYY-MM-DD (sin tiempo)
    const dateOnly = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
    // Validar que sea un formato de fecha válido (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateOnly)) {
      throw new Error(`Invalid date format: ${dateStr}. Expected YYYY-MM-DD`);
    }
    issueStartDate = dateOnly;
  }

  const serviceCategory = mapServiceTypeToCategory(service.serviceType);
  const isEnrollment = service.serviceType === "enrollment";
  const isBuyback = service.serviceType === "buyback";
  const isDataWipe = service.serviceType === "data-wipe";
  const isCleaning = service.serviceType === "cleaning";
  const isDonations = service.serviceType === "donations";
  const isStorage = service.serviceType === "storage";
  const isDestructionRecycling =
    service.serviceType === "destruction-recycling";
  const isLogistics = service.serviceType === "logistics";
  const isOffboarding = service.serviceType === "offboarding";

  // Para Enrollment, construir enrolledDevices y productIds
  let enrolledDevices: any[] | undefined = undefined;
  let productIds: string[] | undefined = undefined;

  // Para Buyback, construir products array con productSnapshot y buybackDetails
  let buybackProducts: any[] | undefined = undefined;
  // Para Logistics, construir products array con productSnapshot y destination
  let logisticsProducts: any[] | undefined = undefined;
  // Para Data Wipe, construir assets array con productSnapshot, desirableDate, currentLocation, currentMember, y destination
  let dataWipeAssets: any[] | undefined = undefined;
  // Para Cleaning, construir products array con productSnapshot, desiredDate, cleaningType, additionalComments
  let cleaningProducts: any[] | undefined = undefined;
  // Para Donations, construir products array con productSnapshot y options simples
  let donationProducts: any[] | undefined = undefined;
  // Para Storage, construir products array con productSnapshot y storage details
  let storageProducts: any[] | undefined = undefined;
  // Para Destruction and Recycling, construir products array con productSnapshot
  let destructionProducts: any[] | undefined = undefined;
  // Para Offboarding, construir payload con originMember, products[] con productSnapshot y destination
  let offboardingPayload: any = undefined;

  if (isBuyback) {
    if (!service.assetIds || service.assetIds.length === 0) {
      throw new Error("Buyback service requires at least one asset (assetIds)");
    }
    if (!assetsMap) {
      throw new Error("Buyback service requires assetsMap to build products");
    }

    // Obtener todos los assets seleccionados
    const selectedAssets = service.assetIds
      .map((assetId) => assetsMap.get(assetId))
      .filter((asset) => asset !== undefined);

    if (selectedAssets.length === 0) {
      throw new Error("Buyback service: no valid assets found in assetsMap");
    }

    // Validar countryCode para todos los assets
    validateAssetsCountryCode(selectedAssets, membersMap);

    // Construir products array
    buybackProducts = selectedAssets.map((asset) => {
      // Construir productSnapshot completo (similar a buildEnrolledDeviceFromAsset pero con más campos)
      const brand =
        asset.attributes?.find(
          (attr: any) =>
            attr.key === "Brand" ||
            attr.key === "brand" ||
            String(attr.key).toLowerCase() === "brand"
        )?.value || "";
      const model =
        asset.attributes?.find(
          (attr: any) =>
            attr.key === "Model" ||
            attr.key === "model" ||
            String(attr.key).toLowerCase() === "model"
        )?.value || "";
      const os =
        asset.attributes?.find(
          (attr: any) =>
            attr.key === "OS" ||
            attr.key === "os" ||
            attr.key === "Operating System" ||
            String(attr.key).toLowerCase() === "operating system"
        )?.value || "";
      const processor =
        asset.attributes?.find(
          (attr: any) =>
            attr.key === "Processor" ||
            attr.key === "processor" ||
            String(attr.key).toLowerCase() === "processor"
        )?.value || "";
      const ram =
        asset.attributes?.find(
          (attr: any) =>
            attr.key === "RAM" ||
            attr.key === "ram" ||
            String(attr.key).toLowerCase() === "ram"
        )?.value || "";
      const storage =
        asset.attributes?.find(
          (attr: any) =>
            attr.key === "Storage" ||
            attr.key === "storage" ||
            String(attr.key).toLowerCase() === "storage"
        )?.value || "";
      const screenSize =
        asset.attributes?.find(
          (attr: any) =>
            attr.key === "Screen Size" ||
            attr.key === "screenSize" ||
            attr.key === "screen size" ||
            String(attr.key).toLowerCase() === "screen size"
        )?.value || "";
      // productCondition viene directamente del asset
      const productCondition = asset.productCondition || "";

      // Determinar location y assignedTo
      let location = "";
      let assignedTo = "";
      let rawCountryCode: string | null = null;

      if (asset.assignedMember || asset.assignedEmail) {
        location = asset.location || "";
        assignedTo = asset.assignedMember || asset.assignedEmail || "";
        const memberEmail = asset.assignedEmail || asset.assignedMember;
        if (memberEmail && membersMap) {
          const member = membersMap.get(memberEmail.toLowerCase());
          if (member?.country && member.country.trim() !== "") {
            rawCountryCode = member.country;
          }
        }
        if (!rawCountryCode) {
          rawCountryCode = asset.countryCode || asset.country || null;
        }
      } else if (asset.location === "Our office") {
        location = "Our office";
        assignedTo = asset.office?.officeName || asset.officeName || "";
        rawCountryCode =
          asset.office?.officeCountryCode ||
          asset.countryCode ||
          asset.country ||
          null;
      } else if (asset.location === "FP warehouse") {
        location = "FP warehouse";
        assignedTo = asset.officeName || asset.office?.officeName || "";
        rawCountryCode =
          asset.fpWarehouse?.warehouseCountryCode ||
          asset.countryCode ||
          asset.country ||
          null;
      } else if (asset.location) {
        location = asset.location;
        assignedTo = "";
        rawCountryCode =
          asset.office?.officeCountryCode ||
          asset.fpWarehouse?.warehouseCountryCode ||
          asset.countryCode ||
          asset.country ||
          null;
      }

      const countryCode = normalizeCountryCode(rawCountryCode);

      if (!countryCode || countryCode.trim() === "") {
        throw new Error(
          `Buyback asset countryCode is required but not found. Asset ID: ${asset._id}`
        );
      }

      // Obtener buybackDetails para este asset
      const buybackDetail = service.buybackDetails?.[asset._id];

      // Construir productSnapshot con campos requeridos
      // Usar el nombre del asset o un valor por defecto basado en la categoría
      const assetName = asset.name || asset.category || "Asset";

      // Validar que los campos requeridos estén presentes antes de construir productSnapshot
      if (!asset.category || asset.category.trim() === "") {
        throw new Error(`Buyback asset ${asset._id}: category is required`);
      }
      if (!location || location.trim() === "") {
        throw new Error(`Buyback asset ${asset._id}: location is required`);
      }
      if (assignedTo === undefined || assignedTo === null) {
        throw new Error(
          `Buyback asset ${asset._id}: assignedTo is required (can be empty string)`
        );
      }
      if (!countryCode || countryCode.trim() === "") {
        throw new Error(`Buyback asset ${asset._id}: countryCode is required`);
      }

      // Construir productSnapshot - brand y model son requeridos según el ejemplo
      const productSnapshot: any = {
        category: asset.category,
        name: assetName,
        brand: brand || "", // Brand es requerido, puede ser string vacío
        model: model || "", // Model es requerido, puede ser string vacío
        location: location,
        assignedTo: assignedTo || "", // Asegurar que sea string, no null/undefined
        countryCode: countryCode,
      };

      // serialNumber solo se incluye si existe (el backend lo pide solo si existe)
      if (asset.serialNumber && asset.serialNumber.trim() !== "") {
        productSnapshot.serialNumber = asset.serialNumber;
      }

      // Agregar campos opcionales si existen
      if (os && os.trim() !== "") productSnapshot.os = os;
      if (processor && processor.trim() !== "")
        productSnapshot.processor = processor;
      if (ram && ram.trim() !== "") productSnapshot.ram = ram;
      if (storage && storage.trim() !== "") productSnapshot.storage = storage;
      if (screenSize && screenSize.trim() !== "")
        productSnapshot.screenSize = screenSize;
      if (productCondition && productCondition.trim() !== "") {
        productSnapshot.productCondition = productCondition;
      }

      // additionalInfo puede venir del asset
      if (asset.additionalInfo && asset.additionalInfo.trim() !== "") {
        productSnapshot.additionalInfo = asset.additionalInfo;
      }

      // Construir el objeto del producto - no usar removeUndefinedFields para asegurar que campos requeridos estén presentes
      const productObj: any = {
        productId: asset._id,
        productSnapshot: productSnapshot, // Incluir todos los campos, incluso strings vacíos para campos requeridos
      };

      // Agregar buybackDetails si existe
      // generalFunctionality es obligatorio según los requisitos
      if (buybackDetail) {
        // Validar que generalFunctionality esté presente y no vacío
        if (
          !buybackDetail.generalFunctionality ||
          buybackDetail.generalFunctionality.trim() === ""
        ) {
          throw new Error(
            `Buyback asset ${asset._id}: generalFunctionality is required`
          );
        }

        // Convertir batteryCycles a número si es posible, sino mantener como string
        let batteryCyclesValue: string | number | undefined =
          buybackDetail.batteryCycles;
        if (
          batteryCyclesValue &&
          typeof batteryCyclesValue === "string" &&
          batteryCyclesValue.trim() !== ""
        ) {
          // Intentar convertir a número si es un número válido
          const numValue = Number(batteryCyclesValue);
          if (
            !isNaN(numValue) &&
            isFinite(numValue) &&
            batteryCyclesValue.trim() === numValue.toString()
          ) {
            batteryCyclesValue = numValue;
          }
          // Si no es un número válido, mantener como string (permite texto como "Unknown")
        }

        // Construir buybackDetails
        const buybackDetailsObj: any = {
          generalFunctionality: buybackDetail.generalFunctionality,
        };

        // Agregar campos opcionales solo si tienen valor
        if (
          batteryCyclesValue !== undefined &&
          batteryCyclesValue !== null &&
          batteryCyclesValue !== ""
        ) {
          buybackDetailsObj.batteryCycles = batteryCyclesValue;
        }
        if (
          buybackDetail.aestheticDetails &&
          buybackDetail.aestheticDetails.trim() !== ""
        ) {
          buybackDetailsObj.aestheticDetails = buybackDetail.aestheticDetails;
        }
        // hasCharger por defecto true (incluye cargador)
        const hasCharger = buybackDetail.hasCharger ?? true;
        buybackDetailsObj.hasCharger = hasCharger;
        if (hasCharger) {
          buybackDetailsObj.chargerWorks =
            buybackDetail.chargerWorks !== undefined
              ? buybackDetail.chargerWorks
              : true;
        }
        if (
          buybackDetail.additionalComments &&
          buybackDetail.additionalComments.trim() !== ""
        ) {
          buybackDetailsObj.additionalComments =
            buybackDetail.additionalComments;
        }

        // Siempre agregar buybackDetails ya que generalFunctionality es obligatorio
        productObj.buybackDetails = buybackDetailsObj;
      } else {
        // Si no hay buybackDetail para este asset, lanzar error
        throw new Error(
          `Buyback asset ${asset._id}: buybackDetails is required (generalFunctionality must be provided)`
        );
      }

      return productObj;
    });
  }

  if (isDataWipe) {
    if (!service.assetIds || service.assetIds.length === 0) {
      throw new Error(
        "Data Wipe service requires at least one asset (assetIds)"
      );
    }
    if (!assetsMap) {
      throw new Error("Data Wipe service requires assetsMap to build assets");
    }

    // Obtener todos los assets seleccionados
    const selectedAssets = service.assetIds
      .map((assetId) => assetsMap.get(assetId))
      .filter((asset) => asset !== undefined);

    if (selectedAssets.length === 0) {
      throw new Error("Data Wipe service: no valid assets found in assetsMap");
    }

    // Validar countryCode para todos los assets
    validateAssetsCountryCode(selectedAssets, membersMap);

    // Construir assets array
    dataWipeAssets = selectedAssets.map((asset) => {
      // Construir productSnapshot (similar a Buyback)
      const brand =
        asset.attributes?.find(
          (attr: any) =>
            attr.key === "Brand" ||
            attr.key === "brand" ||
            String(attr.key).toLowerCase() === "brand"
        )?.value || "";
      const model =
        asset.attributes?.find(
          (attr: any) =>
            attr.key === "Model" ||
            attr.key === "model" ||
            String(attr.key).toLowerCase() === "model"
        )?.value || "";

      // Determinar location y assignedTo
      let location = "";
      let assignedTo = "";
      let rawCountryCode: string | null = null;

      if (asset.assignedMember || asset.assignedEmail) {
        location = asset.location || "";
        assignedTo = asset.assignedMember || asset.assignedEmail || "";
        const memberEmail = asset.assignedEmail || asset.assignedMember;
        if (memberEmail && membersMap) {
          const member = membersMap.get(memberEmail.toLowerCase());
          if (member?.country && member.country.trim() !== "") {
            rawCountryCode = member.country;
          }
        }
        if (!rawCountryCode) {
          rawCountryCode = asset.countryCode || asset.country || null;
        }
      } else if (asset.location === "Our office") {
        location = "Our office";
        assignedTo = asset.office?.officeName || asset.officeName || "";
        rawCountryCode =
          asset.office?.officeCountryCode ||
          asset.countryCode ||
          asset.country ||
          null;
      } else if (asset.location === "FP warehouse") {
        location = "FP warehouse";
        assignedTo = asset.officeName || asset.office?.officeName || "";
        rawCountryCode =
          asset.fpWarehouse?.warehouseCountryCode ||
          asset.countryCode ||
          asset.country ||
          null;
      } else if (asset.location) {
        location = asset.location;
        assignedTo = "";
        rawCountryCode =
          asset.office?.officeCountryCode ||
          asset.fpWarehouse?.warehouseCountryCode ||
          asset.countryCode ||
          asset.country ||
          null;
      }

      const countryCode = normalizeCountryCode(rawCountryCode);

      if (!countryCode || countryCode.trim() === "") {
        throw new Error(
          `Data Wipe asset countryCode is required but not found. Asset ID: ${asset._id}`
        );
      }

      // Obtener dataWipeDetail para este asset
      const dataWipeDetail = service.dataWipeDetails?.[asset._id];

      // Construir productSnapshot con campos requeridos
      const assetName = asset.name || asset.category || "Asset";

      const productSnapshot: any = {
        category: asset.category || "Computer",
        name: assetName,
        brand: brand || "",
        model: model || "",
        location: location || "",
        assignedTo: assignedTo || "",
        countryCode: countryCode,
      };

      // serialNumber es opcional para Data Wipe, solo agregarlo si existe
      if (asset.serialNumber && asset.serialNumber.trim() !== "") {
        productSnapshot.serialNumber = asset.serialNumber;
      }

      // Validar que los campos requeridos no estén vacíos
      if (!productSnapshot.category || productSnapshot.category.trim() === "") {
        throw new Error(`Data Wipe asset ${asset._id}: category is required`);
      }
      if (!productSnapshot.name || productSnapshot.name.trim() === "") {
        productSnapshot.name = asset.category || "Asset";
      }
      // serialNumber ya no es requerido para Data Wipe
      if (!productSnapshot.location || productSnapshot.location.trim() === "") {
        throw new Error(`Data Wipe asset ${asset._id}: location is required`);
      }
      if (
        productSnapshot.assignedTo === undefined ||
        productSnapshot.assignedTo === null
      ) {
        throw new Error(
          `Data Wipe asset ${asset._id}: assignedTo is required (can be empty string)`
        );
      }
      if (
        !productSnapshot.countryCode ||
        productSnapshot.countryCode.trim() === ""
      ) {
        throw new Error(
          `Data Wipe asset ${asset._id}: countryCode is required`
        );
      }

      // Construir el objeto del asset
      const assetObj: any = {
        productId: asset._id,
        productSnapshot: removeUndefinedFields(productSnapshot),
      };

      // Agregar desirableDate si existe
      if (dataWipeDetail?.desirableDate) {
        // Validar formato de fecha YYYY-MM-DD
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(dataWipeDetail.desirableDate)) {
          throw new Error(
            `Data Wipe asset ${asset._id}: Invalid date format. Expected YYYY-MM-DD`
          );
        }
        assetObj.desirableDate = dataWipeDetail.desirableDate;
      }

      // Agregar currentLocation
      if (location) {
        assetObj.currentLocation = location;
      }

      // Agregar currentMember si está asignado a un miembro
      if (asset.assignedMember || asset.assignedEmail) {
        const memberEmail = asset.assignedEmail || asset.assignedMember;
        if (memberEmail && membersMap) {
          const member = membersMap.get(memberEmail.toLowerCase());
          if (member) {
            assetObj.currentMember = {
              memberId: member._id,
              assignedMember: `${member.firstName} ${member.lastName}`,
              assignedEmail: member.email || "",
              countryCode: normalizeCountryCode(member.country) || "",
            };
          }
        }
      }

      // Agregar currentOffice si está en "Our office"
      if (asset.location === "Our office" && asset.office) {
        const officeCountryCode = normalizeCountryCode(
          asset.office.officeCountryCode ||
            asset.countryCode ||
            asset.country ||
            ""
        );
        if (officeCountryCode) {
          assetObj.currentOffice = {
            officeId: asset.office._id || asset.officeId || "",
            officeName: asset.office.officeName || asset.officeName || "",
            countryCode: officeCountryCode,
          };
        }
      }

      // Agregar currentWarehouse si está en "FP warehouse"
      if (asset.location === "FP warehouse") {
        const warehouseCountryCode = normalizeCountryCode(
          asset.fpWarehouse?.warehouseCountryCode ||
            asset.countryCode ||
            asset.country ||
            ""
        );
        if (warehouseCountryCode) {
          assetObj.currentWarehouse = {
            countryCode: warehouseCountryCode,
          };
        }
      }

      // Agregar destination si existe
      if (dataWipeDetail?.destination) {
        const dest = dataWipeDetail.destination;
        const destinationObj: any = {};

        // Mapear los tipos de destino para el backend
        if (dest.destinationType) {
          if (dest.destinationType === "Member") {
            destinationObj.destinationType = "Employee";
          } else if (dest.destinationType === "Office") {
            destinationObj.destinationType = "Our office";
          } else {
            destinationObj.destinationType = dest.destinationType;
          }
        }

        if (dest.member) {
          destinationObj.member = removeUndefinedFields(dest.member);
        }
        if (dest.office) {
          destinationObj.office = removeUndefinedFields(dest.office);
        }
        if (dest.warehouse) {
          destinationObj.warehouse = removeUndefinedFields(dest.warehouse);
        }

        if (Object.keys(destinationObj).length > 0) {
          assetObj.destination = destinationObj;
        }
      }

      return removeUndefinedFields(assetObj);
    });
  }

  if (isCleaning) {
    if (!service.assetIds || service.assetIds.length === 0) {
      throw new Error(
        "Cleaning service requires at least one asset (assetIds)"
      );
    }
    if (!assetsMap) {
      throw new Error("Cleaning service requires assetsMap to build products");
    }

    const selectedCleaningAssets = service.assetIds
      .map((assetId) => assetsMap.get(assetId))
      .filter((asset) => asset !== undefined);

    if (selectedCleaningAssets.length === 0) {
      throw new Error("Cleaning service: no valid assets found in assetsMap");
    }

    validateAssetsCountryCode(selectedCleaningAssets, membersMap);

    const desiredDate =
      service.requiredDeliveryDate &&
      /^\d{4}-\d{2}-\d{2}$/.test(
        service.requiredDeliveryDate.includes("T")
          ? service.requiredDeliveryDate.split("T")[0]
          : service.requiredDeliveryDate
      )
        ? service.requiredDeliveryDate.includes("T")
          ? service.requiredDeliveryDate.split("T")[0]
          : service.requiredDeliveryDate
        : undefined;
    const cleaningTypeValue = service.cleaningType ?? "Deep";

    cleaningProducts = selectedCleaningAssets.map((asset) => {
      const brand =
        asset.attributes?.find(
          (attr: any) =>
            attr.key === "Brand" ||
            attr.key === "brand" ||
            String(attr.key).toLowerCase() === "brand"
        )?.value || "";
      const model =
        asset.attributes?.find(
          (attr: any) =>
            attr.key === "Model" ||
            attr.key === "model" ||
            String(attr.key).toLowerCase() === "model"
        )?.value || "";

      let location = "";
      let assignedTo = "";
      let assignedEmail: string | undefined = undefined;
      let rawCountryCode: string | null = null;

      if (asset.assignedMember || asset.assignedEmail) {
        location = "Employee";
        assignedTo = asset.assignedMember || asset.assignedEmail || "";
        assignedEmail = asset.assignedEmail || undefined;
        const memberEmail = asset.assignedEmail || asset.assignedMember;
        if (memberEmail && membersMap) {
          const member = membersMap.get(memberEmail.toLowerCase());
          if (member?.country && member.country.trim() !== "") {
            rawCountryCode = member.country;
          }
        }
        if (!rawCountryCode) {
          rawCountryCode = asset.countryCode || asset.country || null;
        }
      } else if (asset.location === "Our office") {
        location = "Our office";
        assignedTo = asset.office?.officeName || asset.officeName || "";
        rawCountryCode =
          asset.office?.officeCountryCode ||
          asset.countryCode ||
          asset.country ||
          null;
      } else if (asset.location === "FP warehouse") {
        location = "FP warehouse";
        assignedTo = asset.officeName || asset.office?.officeName || "";
        rawCountryCode =
          asset.fpWarehouse?.warehouseCountryCode ||
          asset.countryCode ||
          asset.country ||
          null;
      } else if (asset.location) {
        location = asset.location;
        assignedTo = "";
        rawCountryCode =
          asset.office?.officeCountryCode ||
          asset.fpWarehouse?.warehouseCountryCode ||
          asset.countryCode ||
          asset.country ||
          null;
      }

      const countryCode = normalizeCountryCode(rawCountryCode);

      if (!countryCode || countryCode.trim() === "") {
        throw new Error(
          `Cleaning asset countryCode is required but not found. Asset ID: ${asset._id}`
        );
      }

      const productSnapshot: any = {
        category: asset.category || "Computer",
        name: asset.name || "",
        brand: brand || "",
        model: model || "",
        serialNumber: asset.serialNumber || "",
        location: location || "",
        assignedTo: assignedTo || "",
        countryCode: countryCode,
      };
      if (assignedEmail) {
        productSnapshot.assignedEmail = assignedEmail;
      }

      const productObj: any = {
        productId: asset._id,
        productSnapshot: removeUndefinedFields(productSnapshot),
        cleaningType: cleaningTypeValue,
      };
      if (desiredDate) {
        productObj.desiredDate = desiredDate;
      }

      return removeUndefinedFields(productObj);
    });
  }

  if (isEnrollment) {
    if (!service.assetIds || service.assetIds.length === 0) {
      throw new Error(
        "Enrollment service requires at least one asset (assetIds)"
      );
    }
    if (!assetsMap) {
      throw new Error(
        "Enrollment service requires assetsMap to build enrolledDevices"
      );
    }

    // Obtener todos los assets seleccionados
    const selectedAssets = service.assetIds
      .map((assetId) => assetsMap.get(assetId))
      .filter((asset) => asset !== undefined);

    // Validar todos los assets antes de procesarlos
    console.log(
      "🔍 Validando countryCode para todos los assets seleccionados..."
    );
    validateAssetsCountryCode(selectedAssets, membersMap);

    productIds = service.assetIds;
    enrolledDevices = selectedAssets.map((asset) =>
      buildEnrolledDeviceFromAsset(asset, membersMap)
    );

    if (enrolledDevices.length === 0) {
      throw new Error("Enrollment service: no valid assets found in assetsMap");
    }

    // Validar que todos los enrolledDevices tengan los campos requeridos
    enrolledDevices.forEach((device, index) => {
      if (!device.category || device.category.trim() === "") {
        throw new Error(`Enrolled device ${index}: category is required`);
      }
      // brand y model pueden ser strings vacíos según el ejemplo
      // serialNumber, location, countryCode son requeridos
      if (device.serialNumber === undefined || device.serialNumber === null) {
        throw new Error(`Enrolled device ${index}: serialNumber is required`);
      }
      if (!device.location || device.location.trim() === "") {
        throw new Error(`Enrolled device ${index}: location is required`);
      }
      if (device.assignedTo === undefined || device.assignedTo === null) {
        throw new Error(
          `Enrolled device ${index}: assignedTo is required (can be empty string)`
        );
      }
      if (!device.countryCode || device.countryCode.trim() === "") {
        throw new Error(`Enrolled device ${index}: countryCode is required`);
      }
    });
  }

  if (isDonations) {
    if (!service.assetIds || service.assetIds.length === 0) {
      throw new Error(
        "Donations service requires at least one asset (assetIds)"
      );
    }
    if (!assetsMap) {
      throw new Error("Donations service requires assetsMap to build products");
    }

    const selectedDonationAssets = service.assetIds
      .map((assetId) => assetsMap.get(assetId))
      .filter((asset) => asset !== undefined);

    if (selectedDonationAssets.length === 0) {
      throw new Error("Donations service: no valid assets found in assetsMap");
    }

    validateAssetsCountryCode(selectedDonationAssets, membersMap);

    donationProducts = selectedDonationAssets.map((asset) => {
      const brand =
        asset.attributes?.find(
          (attr: any) =>
            attr.key === "Brand" ||
            attr.key === "brand" ||
            String(attr.key).toLowerCase() === "brand"
        )?.value || "";
      const model =
        asset.attributes?.find(
          (attr: any) =>
            attr.key === "Model" ||
            attr.key === "model" ||
            String(attr.key).toLowerCase() === "model"
        )?.value || "";

      let location = "";
      let assignedTo = "";
      let assignedEmail: string | undefined = undefined;
      let rawCountryCode: string | null = null;

      if (asset.assignedMember || asset.assignedEmail) {
        location = "Employee";
        assignedTo = asset.assignedMember || asset.assignedEmail || "";
        assignedEmail = asset.assignedEmail || undefined;
        const memberEmail = asset.assignedEmail || asset.assignedMember;
        if (memberEmail && membersMap) {
          const member = membersMap.get(memberEmail.toLowerCase());
          if (member?.country && member.country.trim() !== "") {
            rawCountryCode = member.country;
          }
        }
        if (!rawCountryCode) {
          rawCountryCode = asset.countryCode || asset.country || null;
        }
      } else if (asset.location === "Our office") {
        location = "Our office";
        assignedTo = asset.office?.officeName || asset.officeName || "";
        rawCountryCode =
          asset.office?.officeCountryCode ||
          asset.countryCode ||
          asset.country ||
          null;
      } else if (asset.location === "FP warehouse") {
        location = "FP warehouse";
        assignedTo = asset.officeName || asset.office?.officeName || "";
        rawCountryCode =
          asset.fpWarehouse?.warehouseCountryCode ||
          asset.countryCode ||
          asset.country ||
          null;
      } else if (asset.location) {
        location = asset.location;
        assignedTo = "";
        rawCountryCode =
          asset.office?.officeCountryCode ||
          asset.fpWarehouse?.warehouseCountryCode ||
          asset.countryCode ||
          asset.country ||
          null;
      }

      const countryCode = normalizeCountryCode(rawCountryCode);
      if (!countryCode || countryCode.trim() === "") {
        throw new Error(
          `Donations asset countryCode is required but not found. Asset ID: ${asset._id}`
        );
      }

      const productSnapshot: any = {
        category: asset.category || "Computer",
        name: asset.name || "",
        brand: brand || "",
        model: model || "",
        location: location || "",
        assignedTo: assignedTo || "",
        countryCode: countryCode,
      };
      if (asset.serialNumber && asset.serialNumber.trim() !== "") {
        productSnapshot.serialNumber = asset.serialNumber;
      }
      if (assignedEmail) {
        productSnapshot.assignedEmail = assignedEmail;
      }

      const productObj: any = {
        productId: asset._id,
        productSnapshot: removeUndefinedFields(productSnapshot),
        ...(service.donationDataWipe ? { needsDataWipe: true } : {}),
        ...(service.donationProfessionalCleaning
          ? { needsCleaning: true }
          : {}),
      };

      return removeUndefinedFields(productObj);
    });
  }

  if (isStorage) {
    if (!service.assetIds || service.assetIds.length === 0) {
      throw new Error("Storage service requires at least one asset (assetIds)");
    }
    if (!assetsMap) {
      throw new Error("Storage service requires assetsMap to build products");
    }

    const selectedStorageAssets = service.assetIds
      .map((assetId) => assetsMap.get(assetId))
      .filter((a) => a !== undefined);

    if (selectedStorageAssets.length === 0) {
      throw new Error("Storage service: no valid assets found in assetsMap");
    }

    validateAssetsCountryCode(selectedStorageAssets, membersMap);

    const storageDetailsMap = service.storageDetails || {};

    storageProducts = selectedStorageAssets.map((asset) => {
      const brand =
        asset.attributes?.find(
          (attr: any) =>
            attr.key === "Brand" ||
            attr.key === "brand" ||
            String(attr.key).toLowerCase() === "brand"
        )?.value || "";
      const model =
        asset.attributes?.find(
          (attr: any) =>
            attr.key === "Model" ||
            attr.key === "model" ||
            String(attr.key).toLowerCase() === "model"
        )?.value || "";

      let location = "";
      let assignedTo = "";
      let assignedEmail: string | undefined = undefined;
      let rawCountryCode: string | null = null;

      if (asset.assignedMember || asset.assignedEmail) {
        location = "Employee";
        assignedTo = asset.assignedMember || asset.assignedEmail || "";
        assignedEmail = asset.assignedEmail || undefined;
        const memberEmail = asset.assignedEmail || asset.assignedMember;
        if (memberEmail && membersMap) {
          const member = membersMap.get(memberEmail.toLowerCase());
          if (member?.country && member.country.trim() !== "") {
            rawCountryCode = member.country;
          }
        }
        if (!rawCountryCode) {
          rawCountryCode = asset.countryCode || asset.country || null;
        }
      } else if (asset.location === "Our office") {
        location = "Our office";
        assignedTo = asset.office?.officeName || asset.officeName || "";
        rawCountryCode =
          asset.office?.officeCountryCode ||
          asset.countryCode ||
          asset.country ||
          null;
      } else if (asset.location === "FP warehouse") {
        location = "FP warehouse";
        assignedTo = asset.officeName || asset.office?.officeName || "";
        rawCountryCode =
          asset.fpWarehouse?.warehouseCountryCode ||
          asset.countryCode ||
          asset.country ||
          null;
      } else if (asset.location) {
        location = asset.location;
        assignedTo = "";
        rawCountryCode =
          asset.office?.officeCountryCode ||
          asset.fpWarehouse?.warehouseCountryCode ||
          asset.countryCode ||
          asset.country ||
          null;
      }

      const countryCode = normalizeCountryCode(rawCountryCode);
      if (!countryCode || countryCode.trim() === "") {
        throw new Error(
          `Storage asset countryCode is required but not found. Asset ID: ${asset._id}`
        );
      }

      const productSnapshot: any = {
        category: asset.category || "Computer",
        name: asset.name || "",
        brand: brand || "",
        model: model || "",
        serialNumber: asset.serialNumber || "",
        location: location || "",
        assignedTo: assignedTo || "",
        countryCode: countryCode,
      };
      if (assignedEmail) {
        productSnapshot.assignedEmail = assignedEmail;
      }

      const detail: Partial<StorageDetail> = storageDetailsMap[asset._id] ?? {};
      const productObj: any = {
        productId: asset._id,
        productSnapshot: removeUndefinedFields(productSnapshot),
      };
      if (
        detail.approximateSize !== undefined &&
        detail.approximateSize !== ""
      ) {
        productObj.approximateSize = detail.approximateSize;
      }
      if (
        detail.approximateWeight !== undefined &&
        detail.approximateWeight !== ""
      ) {
        productObj.approximateWeight = detail.approximateWeight;
      }
      if (
        detail.approximateStorageDays !== undefined &&
        detail.approximateStorageDays.trim() !== ""
      ) {
        productObj.approximateStorageDays = detail.approximateStorageDays;
      }
      if (
        detail.additionalComments !== undefined &&
        detail.additionalComments.trim() !== ""
      ) {
        productObj.additionalComments = detail.additionalComments;
      }

      return removeUndefinedFields(productObj);
    });
  }

  if (isDestructionRecycling) {
    if (!service.assetIds || service.assetIds.length === 0) {
      throw new Error(
        "Destruction and Recycling service requires at least one asset (assetIds)"
      );
    }
    if (!assetsMap) {
      throw new Error(
        "Destruction and Recycling service requires assetsMap to build products"
      );
    }

    const selectedDestructionAssets = service.assetIds
      .map((assetId) => assetsMap.get(assetId))
      .filter((a) => a !== undefined);

    if (selectedDestructionAssets.length === 0) {
      throw new Error(
        "Destruction and Recycling service: no valid assets found in assetsMap"
      );
    }

    validateAssetsCountryCode(selectedDestructionAssets, membersMap);

    destructionProducts = selectedDestructionAssets.map((asset) => {
      const brand =
        asset.attributes?.find(
          (attr: any) =>
            attr.key === "Brand" ||
            attr.key === "brand" ||
            String(attr.key).toLowerCase() === "brand"
        )?.value || "";
      const model =
        asset.attributes?.find(
          (attr: any) =>
            attr.key === "Model" ||
            attr.key === "model" ||
            String(attr.key).toLowerCase() === "model"
        )?.value || "";

      let location = "";
      let assignedTo = "";
      let rawCountryCode: string | null = null;

      if (asset.assignedMember || asset.assignedEmail) {
        location = asset.location || "Employee";
        assignedTo = asset.assignedMember || asset.assignedEmail || "";
        const memberEmail = asset.assignedEmail || asset.assignedMember;
        if (memberEmail && membersMap) {
          const member = membersMap.get(memberEmail.toLowerCase());
          if (member?.country && member.country.trim() !== "") {
            rawCountryCode = member.country;
          }
        }
        if (!rawCountryCode) {
          rawCountryCode = asset.countryCode || asset.country || null;
        }
      } else if (asset.location === "Our office") {
        location = "Our office";
        assignedTo = asset.office?.officeName || asset.officeName || "";
        rawCountryCode =
          asset.office?.officeCountryCode ||
          asset.countryCode ||
          asset.country ||
          null;
      } else if (asset.location === "FP warehouse") {
        location = "FP warehouse";
        assignedTo = asset.officeName || asset.office?.officeName || "";
        rawCountryCode =
          asset.fpWarehouse?.warehouseCountryCode ||
          asset.countryCode ||
          asset.country ||
          null;
      } else if (asset.location) {
        location = asset.location;
        assignedTo = "";
        rawCountryCode =
          asset.office?.officeCountryCode ||
          asset.fpWarehouse?.warehouseCountryCode ||
          asset.countryCode ||
          asset.country ||
          null;
      }

      const countryCode = normalizeCountryCode(rawCountryCode);
      if (!countryCode || countryCode.trim() === "") {
        throw new Error(
          `Destruction asset countryCode is required but not found. Asset ID: ${asset._id}`
        );
      }

      const productSnapshot: any = {
        category: asset.category || "Computer",
        name: asset.name || asset.category || "Asset",
        brand: brand || "",
        model: model || "",
        serialNumber: asset.serialNumber || "",
        location: location || "",
        assignedTo: assignedTo || "",
        countryCode: countryCode,
      };

      return {
        productId: asset._id,
        productSnapshot: removeUndefinedFields(productSnapshot),
      };
    });
  }

  // Construir productSnapshot si hay asset (para IT Support)
  let productSnapshot: any = undefined;
  if (
    asset &&
    service.assetId &&
    !isEnrollment &&
    !isStorage &&
    !isDestructionRecycling &&
    !isLogistics
  ) {
    productSnapshot = buildEnrolledDeviceFromAsset(asset);
  }

  // Mapear issue types a labels
  const issues: string[] = [];
  if (service.issueTypes && service.issueTypes.length > 0) {
    service.issueTypes.forEach((issueId) => {
      const label = issueTypesMap[issueId] || issueId;
      issues.push(label);
    });
  }

  const transformed: any = {
    serviceCategory: serviceCategory,
  };

  // Para IT Support
  if (
    service.assetId &&
    !isEnrollment &&
    !isBuyback &&
    !isDataWipe &&
    !isCleaning &&
    !isDonations &&
    !isStorage &&
    !isDestructionRecycling &&
    !isLogistics
  ) {
    transformed.productId = service.assetId;
  }

  if (
    productSnapshot &&
    !isEnrollment &&
    !isBuyback &&
    !isDataWipe &&
    !isCleaning &&
    !isDonations &&
    !isStorage &&
    !isDestructionRecycling &&
    !isLogistics
  ) {
    transformed.productSnapshot = productSnapshot;
  }

  // Para Logistics - payload: serviceCategory "Logistics", desirablePickupDate, additionalDetails, products[] con productSnapshot y destination
  if (isLogistics) {
    if (!service.assetIds || service.assetIds.length === 0) {
      throw new Error("Logistics service requires at least one asset (assetIds)");
    }
    if (!assetsMap) {
      throw new Error("Logistics service requires assetsMap to build products");
    }
    const selectedLogisticsAssets = service.assetIds
      .map((assetId) => assetsMap!.get(assetId))
      .filter((a) => a !== undefined);

    if (selectedLogisticsAssets.length === 0) {
      throw new Error(
        "Logistics service: no valid assets found in assetsMap"
      );
    }

    validateAssetsCountryCode(selectedLogisticsAssets, membersMap);

    const sameDetailsForAllAssets = service.sameDetailsForAllAssets === true;
    const perAssetData = service.logisticsDetailsPerAsset && Object.keys(service.logisticsDetailsPerAsset).length > 0;
    const usePerAssetDates = !sameDetailsForAllAssets && perAssetData;

    const buildDestinationPayload = (
      dest: NonNullable<typeof service.logisticsDestination>,
      countryCode: string
    ) => {
      const isGenericFpWarehouse = dest.type === "Warehouse" && !dest.warehouseId;
      const payload =
        dest.type === "Office"
          ? {
              type: "Office" as const,
              officeName: dest.officeName || "",
              countryCode: dest.countryCode || "",
            }
          : dest.type === "Member"
          ? {
              type: "Member" as const,
              memberId: dest.memberId || "",
              assignedMember: dest.assignedMember || "",
              assignedEmail: dest.assignedEmail || "",
              countryCode: dest.countryCode || "",
            }
          : dest.type === "Warehouse" && dest.warehouseId
          ? {
              type: "Warehouse" as const,
              ...(dest.warehouseId && { warehouseId: dest.warehouseId }),
              ...(dest.warehouseName && { warehouseName: dest.warehouseName }),
              countryCode: dest.countryCode || "",
            }
          : undefined;
      if (isGenericFpWarehouse) return { type: "Warehouse" as const, countryCode };
      if (!payload) throw new Error("Logistics service: invalid logisticsDestination type");
      return payload;
    };

    const perAsset = service.logisticsDetailsPerAsset || {};
    for (const assetId of service.assetIds!) {
      const d = perAsset[assetId];
      if (!d?.logisticsDestination) {
        throw new Error(
          `Logistics service: each asset must have a destination. Missing for asset ${assetId}`
        );
      }
      if (usePerAssetDates && (!d.desirablePickupDate || !d.desirableDeliveryDate)) {
        throw new Error(
          `Logistics service: each asset must have pickup and delivery date when not using same details. Missing for asset ${assetId}`
        );
      }
    }
    if (sameDetailsForAllAssets) {
      if (!service.desirablePickupDate || !service.desirableDeliveryDate) {
        throw new Error("Logistics service requires desirablePickupDate and desirableDeliveryDate when using same details for all assets");
      }
    }

    logisticsProducts = selectedLogisticsAssets.map((asset) => {
      const brand =
        asset.attributes?.find(
          (attr: any) =>
            attr.key === "Brand" ||
            attr.key === "brand" ||
            String(attr.key).toLowerCase() === "brand"
        )?.value || "";
      const model =
        asset.attributes?.find(
          (attr: any) =>
            attr.key === "Model" ||
            attr.key === "model" ||
            String(attr.key).toLowerCase() === "model"
        )?.value || "";

      let location = "";
      let assignedTo = "";
      let rawCountryCode: string | null = null;

      if (asset.assignedMember || asset.assignedEmail) {
        location = asset.location || "Employee";
        assignedTo = asset.assignedMember || asset.assignedEmail || "";
        const memberEmail = asset.assignedEmail || asset.assignedMember;
        if (memberEmail && membersMap) {
          const member = membersMap.get(memberEmail.toLowerCase());
          if (member?.country && member.country.trim() !== "") {
            rawCountryCode = member.country;
          }
        }
        if (!rawCountryCode) {
          rawCountryCode = asset.countryCode || asset.country || null;
        }
      } else if (asset.location === "Our office") {
        location = "Our office";
        assignedTo = asset.office?.officeName || asset.officeName || "";
        rawCountryCode =
          asset.office?.officeCountryCode ||
          asset.countryCode ||
          asset.country ||
          null;
      } else if (asset.location === "FP warehouse") {
        location = "FP warehouse";
        assignedTo = asset.officeName || asset.office?.officeName || "";
        rawCountryCode =
          asset.fpWarehouse?.warehouseCountryCode ||
          asset.countryCode ||
          asset.country ||
          null;
      } else if (asset.location) {
        location = asset.location;
        assignedTo = "";
        rawCountryCode =
          asset.office?.officeCountryCode ||
          asset.fpWarehouse?.warehouseCountryCode ||
          asset.countryCode ||
          asset.country ||
          null;
      }

      const countryCode = normalizeCountryCode(rawCountryCode);
      if (!countryCode || countryCode.trim() === "") {
        throw new Error(
          `Logistics asset countryCode is required but not found. Asset ID: ${asset._id}`
        );
      }

      const productSnapshotLogistics: any = {
        category: asset.category || "Computer",
        name: asset.name || asset.category || "Asset",
        brand: brand || "",
        model: model || "",
        serialNumber: asset.serialNumber || "",
        location: location || "",
        assignedTo: assignedTo || "",
        countryCode: countryCode,
      };
      if (asset.assignedEmail) {
        productSnapshotLogistics.assignedEmail = asset.assignedEmail;
      }
      if (asset.assignedMember && !asset.assignedEmail) {
        productSnapshotLogistics.assignedEmail = asset.assignedMember;
      }

      const d = perAsset[asset._id];
      const productDestination = buildDestinationPayload(d!.logisticsDestination!, countryCode);
      const desirablePickupDate = usePerAssetDates ? d!.desirablePickupDate : service.desirablePickupDate;
      const desirableDeliveryDate = usePerAssetDates ? d!.desirableDeliveryDate : service.desirableDeliveryDate;

      const product: any = {
        productId: asset._id,
        productSnapshot: removeUndefinedFields(productSnapshotLogistics),
        destination: productDestination,
      };
      if (desirablePickupDate) product.desirablePickupDate = desirablePickupDate;
      if (desirableDeliveryDate) product.desirableDeliveryDate = desirableDeliveryDate;
      return product;
    });

    const firstProduct = logisticsProducts[0] as any;
    const logisticsService: any = {
      serviceCategory: serviceCategory,
      desirablePickupDate: usePerAssetDates
        ? firstProduct?.desirablePickupDate
        : service.desirablePickupDate,
      products: logisticsProducts,
    };
    if (service.additionalDetails && service.additionalDetails.trim() !== "") {
      logisticsService.additionalDetails = service.additionalDetails;
    }
    const serviceDeliveryDate = usePerAssetDates
      ? firstProduct?.desirableDeliveryDate
      : service.desirableDeliveryDate;
    if (serviceDeliveryDate) {
      logisticsService.desirableDeliveryDate = serviceDeliveryDate;
    }

    return removeUndefinedFields(logisticsService) as NonNullable<
      QuoteRequestPayload["services"]
    >[0];
  }

  // Para Offboarding - payload: serviceCategory "Offboarding", originMember, isSensitiveSituation, employeeKnows, desirablePickupDate, products[], additionalDetails
  if (isOffboarding) {
    if (!service.memberId) {
      throw new Error("Offboarding service requires memberId (origin member)");
    }
    if (!service.assetIds || service.assetIds.length === 0) {
      throw new Error("Offboarding service requires at least one asset (assetIds)");
    }
    if (!assetsMap) {
      throw new Error("Offboarding service requires assetsMap to build products");
    }
    const originMemberFromMap = membersMapById?.get(service.memberId);
    if (!originMemberFromMap) {
      throw new Error(
        "Offboarding service: origin member not found in membersMapById. Ensure members are loaded and passed by id."
      );
    }
    const countryCodeOrigin = normalizeCountryCode(
      originMemberFromMap.countryCode || originMemberFromMap.country || ""
    );
    const originMember = {
      memberId: service.memberId,
      firstName: originMemberFromMap.firstName || "",
      lastName: originMemberFromMap.lastName || "",
      email: originMemberFromMap.email || "",
      countryCode: countryCodeOrigin || "",
    };

    const selectedOffboardingAssets = service.assetIds
      .map((assetId) => assetsMap!.get(assetId))
      .filter((a) => a !== undefined);

    if (selectedOffboardingAssets.length === 0) {
      throw new Error(
        "Offboarding service: no valid assets found in assetsMap"
      );
    }

    validateAssetsCountryCode(selectedOffboardingAssets, membersMap);

    const perAsset = service.offboardingDetailsPerAsset || {};
    const offboardingProducts = selectedOffboardingAssets.map((asset) => {
      const brand =
        asset.attributes?.find(
          (attr: any) =>
            attr.key === "Brand" ||
            attr.key === "brand" ||
            String(attr.key).toLowerCase() === "brand"
        )?.value || "";
      const model =
        asset.attributes?.find(
          (attr: any) =>
            attr.key === "Model" ||
            attr.key === "model" ||
            String(attr.key).toLowerCase() === "model"
        )?.value || "";
      let location = "";
      let assignedTo = "";
      if (asset.assignedMember || asset.assignedEmail) {
        location = asset.location || "Employee";
        assignedTo = asset.assignedMember || asset.assignedEmail || "";
      } else if (asset.location === "Our office") {
        location = "Our office";
        assignedTo = asset.officeName || asset.office?.officeName || "";
      } else if (asset.location === "FP warehouse") {
        location = "FP warehouse";
        assignedTo = "FP Warehouse";
      } else if (asset.location) {
        location = asset.location;
        assignedTo = "";
      }
      const rawCountryCode =
        asset.office?.officeCountryCode ||
        asset.countryCode ||
        asset.country ||
        (assignedTo && membersMap
          ? (membersMap.get((asset.assignedEmail || asset.assignedMember || "").toLowerCase()) as any)?.country
          : null);
      const countryCode = normalizeCountryCode(rawCountryCode) || "";

      const productSnapshot: any = {
        category: asset.category || "Other",
        brand: brand || "",
        model: model || "",
        serialNumber: asset.serialNumber || "",
        location: location || "Employee",
        assignedTo: assignedTo || "",
        assignedEmail: asset.assignedEmail || assignedTo || "",
        countryCode: countryCode,
      };

      const dest = perAsset[asset._id]?.logisticsDestination;
      if (!dest) {
        throw new Error(
          `Offboarding service: destination is required for asset ${asset._id}`
        );
      }

      const destination =
        dest.type === "Office"
          ? {
              type: "Office" as const,
              officeId: dest.officeId || "",
              officeName: dest.officeName || "",
              countryCode: dest.countryCode || "",
            }
          : dest.type === "Member"
          ? {
              type: "Member" as const,
              memberId: dest.memberId || "",
              assignedMember: dest.assignedMember || "",
              assignedEmail: dest.assignedEmail || "",
              countryCode: dest.countryCode || "",
            }
          : dest.type === "Warehouse"
          ? {
              type: "Warehouse" as const,
              ...(dest.warehouseId && { warehouseId: dest.warehouseId }),
              ...(dest.warehouseName && { warehouseName: dest.warehouseName }),
              countryCode: dest.countryCode || "",
            }
          : undefined;

      if (!destination) {
        throw new Error(
          `Offboarding service: invalid destination type for asset ${asset._id}`
        );
      }

      return {
        productId: asset._id,
        productSnapshot: removeUndefinedFields(productSnapshot),
        destination,
      };
    });

    offboardingPayload = {
      serviceCategory: "Offboarding",
      originMember,
      isSensitiveSituation: service.offboardingSensitiveSituation ?? false,
      employeeKnows: service.offboardingEmployeeAware ?? true,
      desirablePickupDate: service.offboardingPickupDate
        ? (service.offboardingPickupDate.includes("T")
            ? service.offboardingPickupDate.split("T")[0]
            : service.offboardingPickupDate)
        : undefined,
      products: offboardingProducts,
    };
    if (service.additionalComments && service.additionalComments.trim() !== "") {
      offboardingPayload.additionalDetails = service.additionalComments;
    }
    if (!offboardingPayload.desirablePickupDate) {
      throw new Error("Offboarding service requires offboardingPickupDate");
    }
    return removeUndefinedFields(offboardingPayload) as NonNullable<
      QuoteRequestPayload["services"]
    >[0];
  }

  // Para Destruction and Recycling - payload: serviceCategory, products[], requiresCertificate, comments
  if (isDestructionRecycling) {
    if (!destructionProducts || destructionProducts.length === 0) {
      throw new Error(
        "Destruction and Recycling service: products is required"
      );
    }

    const destructionService: any = {
      serviceCategory: serviceCategory,
      products: destructionProducts,
      requiresCertificate: service.requiresCertificate ?? true,
    };
    if (service.comments && service.comments.trim() !== "") {
      destructionService.comments = service.comments;
    }

    return removeUndefinedFields(destructionService) as NonNullable<
      QuoteRequestPayload["services"]
    >[0];
  }

  // Para Storage - payload: serviceCategory "Storage", products[] con productSnapshot y storage details
  if (isStorage) {
    if (!storageProducts || storageProducts.length === 0) {
      throw new Error("Storage service: products is required");
    }

    const storageService: any = {
      serviceCategory: serviceCategory,
      products: storageProducts,
    };

    return removeUndefinedFields(storageService) as NonNullable<
      QuoteRequestPayload["services"]
    >[0];
  }

  // Para Cleaning - payload: serviceCategory, products[], additionalDetails (comentario global)
  if (isCleaning) {
    if (!cleaningProducts || cleaningProducts.length === 0) {
      throw new Error("Cleaning service: products is required");
    }

    const cleaningService: any = {
      serviceCategory: serviceCategory,
      products: cleaningProducts,
    };
    const cleaningAdditionalDetails =
      service.additionalDetails ?? (service as any).additionalComments;
    if (cleaningAdditionalDetails && cleaningAdditionalDetails.trim() !== "") {
      cleaningService.additionalDetails = cleaningAdditionalDetails;
    }

    return removeUndefinedFields(cleaningService) as NonNullable<
      QuoteRequestPayload["services"]
    >[0];
  }

  // Para Donations - payload: serviceCategory "Donate", products[] con flags por producto, additionalDetails a nivel servicio
  if (isDonations) {
    if (!donationProducts || donationProducts.length === 0) {
      throw new Error("Donations service: products is required");
    }

    const donationService: any = {
      serviceCategory: serviceCategory,
      products: donationProducts,
    };

    // additionalDetails a nivel servicio (texto libre)
    if (service.additionalDetails && service.additionalDetails.trim() !== "") {
      donationService.additionalDetails = service.additionalDetails;
    }

    return removeUndefinedFields(donationService) as NonNullable<
      QuoteRequestPayload["services"]
    >[0];
  }

  // Para Enrollment - estos campos son requeridos
  if (isEnrollment) {
    if (!productIds || productIds.length === 0) {
      throw new Error("Enrollment service: productIds is required");
    }
    if (!enrolledDevices || enrolledDevices.length === 0) {
      throw new Error("Enrollment service: enrolledDevices is required");
    }

    transformed.productIds = productIds;
    transformed.enrolledDevices = enrolledDevices;

    // additionalDetails es opcional
    if (service.additionalDetails) {
      transformed.additionalDetails = service.additionalDetails;
    }

    // Para Enrollment, retornar solo los campos necesarios (no incluir campos de IT Support)
    return transformed as NonNullable<QuoteRequestPayload["services"]>[0];
  }

  // Para Buyback - estos campos son requeridos
  if (isBuyback) {
    if (!buybackProducts || buybackProducts.length === 0) {
      throw new Error("Buyback service: products is required");
    }

    // Para Buyback, construir objeto solo con los campos necesarios
    const buybackService: any = {
      serviceCategory: serviceCategory, // Siempre incluir serviceCategory
      products: buybackProducts, // products es requerido
    };

    // additionalInfo es opcional
    if (service.additionalInfo && service.additionalInfo.trim() !== "") {
      buybackService.additionalInfo = service.additionalInfo;
    }

    // Retornar sin usar removeUndefinedFields para asegurar que serviceCategory y products siempre estén presentes
    return buybackService as NonNullable<QuoteRequestPayload["services"]>[0];
  }

  // Para Data Wipe - estos campos son requeridos
  if (isDataWipe) {
    if (!dataWipeAssets || dataWipeAssets.length === 0) {
      throw new Error("Data Wipe service: assets is required");
    }

    transformed.assets = dataWipeAssets;

    // additionalDetails es opcional
    if (service.additionalDetails) {
      transformed.additionalDetails = service.additionalDetails;
    }

    // Para Data Wipe, retornar solo los campos necesarios (no incluir campos de otros servicios)
    return removeUndefinedFields(transformed) as NonNullable<
      QuoteRequestPayload["services"]
    >[0];
  }

  // Para IT Support - agregar campos específicos de IT Support (solo si no es Buyback, Data Wipe, Cleaning, Donations ni Storage)
  if (!isBuyback && !isDataWipe && !isCleaning && !isDonations && !isStorage) {
    if (issues.length > 0) {
      transformed.issues = issues;
    }

    if (service.description) {
      transformed.description = service.description;
    }

    if (issueStartDate) {
      transformed.issueStartDate = issueStartDate;
    }

    if (service.impactLevel) {
      transformed.impactLevel = service.impactLevel;
    }
  }

  // Para otros servicios, usar removeUndefinedFields
  return removeUndefinedFields(transformed) as NonNullable<
    QuoteRequestPayload["services"]
  >[0];
}
