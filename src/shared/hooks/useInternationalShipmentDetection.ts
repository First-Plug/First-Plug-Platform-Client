"use client";

import { useMemo } from "react";
import { Member } from "@/features/members";
import { Product } from "@/features/assets";
import { useOffices } from "@/features/settings";

interface ValidationEntity {
  type: "member" | "office" | "warehouse";
  data: any;
}

export const useInternationalShipmentDetection = () => {
  const { offices } = useOffices();

  const buildInternationalValidationEntities = (
    product: Product,
    allMembers: Member[] = [],
    selectedMember?: Member | null,
    sessionUser?: any,
    noneOption?: string | null,
    selectedOfficeId?: string | null
  ) => {
    let source: ValidationEntity | null = null;
    let destination: ValidationEntity | null = null;

    // Determinar SOURCE basado en la ubicación actual del producto
    // IMPORTANTE: Primero verificar la ubicación (location) del producto, no el assignedEmail
    // porque un producto puede tener assignedEmail histórico pero estar en una oficina

    if (product.location === "Employee") {
      // El producto está con un miembro
      const currentMemberData = allMembers.find(
        (member) => member.email === product.assignedEmail
      );

      if (currentMemberData) {
        source = { type: "member", data: currentMemberData };
      } else if (product.assignedEmail) {
        // El miembro no está en el array, crear objeto básico
        console.warn(
          `Member with email ${product.assignedEmail} not found in allMembers array`
        );
        source = {
          type: "member",
          data: {
            email: product.assignedEmail,
            firstName: product.assignedMember?.split(" ")[0] || "",
            lastName: product.assignedMember?.split(" ")[1] || "",
          },
        };
      }
    } else if (product.location === "FP warehouse") {
      // El producto está en FP warehouse
      const warehouseCountry =
        product.countryCode || product.office?.officeCountryCode || null;

      source = {
        type: "warehouse",
        data: {
          country: warehouseCountry,
          location: "FP warehouse",
        },
      };
    } else if (product.location === "Our office") {
      // El producto está en una oficina
      if (product.officeId) {
        const office = offices?.find(
          (office) => office._id === product.officeId
        );
        if (office) {
          source = {
            type: "office",
            data: { ...office, officeId: office._id },
          };
        } else {
          // Si no se encuentra en el array, crear objeto básico con el officeId
          const officeCountry =
            product.countryCode ||
            product.office?.officeCountryCode ||
            sessionUser?.country ||
            null;

          source = {
            type: "office",
            data: {
              country: officeCountry || "UNKNOWN",
              location: "Our office",
              officeId: product.officeId,
            },
          };
        }
      } else {
        // Si no hay officeId pero está en Our office, usar datos del sessionUser
        console.warn("Product location is 'Our office' but no officeId found");
        source = {
          type: "office",
          data: {
            country: sessionUser?.country || "UNKNOWN",
            location: "Our office",
          },
        };
      }
    }

    if (selectedMember) {
      destination = { type: "member", data: selectedMember };
    } else if (noneOption === "FP warehouse") {
      // Cuando se asigna a FP warehouse, usar el país del origen
      // Si el origen es una oficina, usar el país de esa oficina
      let warehouseCountry = null;

      if (source?.type === "office") {
        warehouseCountry = source.data.country;
      } else if (source?.type === "member") {
        warehouseCountry = source.data.country;
      } else if (source?.type === "warehouse") {
        warehouseCountry = source.data.country;
      }

      // Fallback al país del producto si no hay source
      if (!warehouseCountry) {
        warehouseCountry =
          product.countryCode || product.office?.officeCountryCode || null;
      }

      destination = {
        type: "warehouse",
        data: {
          country: warehouseCountry,
          location: "FP warehouse",
        },
      };
    } else if (
      noneOption &&
      noneOption !== "Employee" &&
      noneOption !== "FP warehouse"
    ) {
      // Si noneOption no es "Employee" ni "FP warehouse", es una oficina específica
      if (selectedOfficeId) {
        const office = offices?.find(
          (office) => office._id === selectedOfficeId
        );
        if (office) {
          destination = {
            type: "office",
            data: { ...office, officeId: office._id },
          };
        } else {
          // Si no se encuentra en el array, crear objeto básico con el officeId
          console.warn(
            `Office with ID ${selectedOfficeId} not found in offices array for destination`
          );
          destination = {
            type: "office",
            data: {
              country: sessionUser?.country || "US",
              location: "Our office",
              officeId: selectedOfficeId,
            },
          };
        }
      } else {
        console.error(
          `noneOption is set to "${noneOption}" but selectedOfficeId is missing`
        );
      }
    }

    console.log("buildInternationalValidationEntities result:", {
      source,
      destination,
      noneOption,
      selectedOfficeId,
    });

    return { source, destination };
  };

  const isInternationalShipment = useMemo(() => {
    return (
      source: ValidationEntity | null,
      destination: ValidationEntity | null
    ): boolean => {
      console.log("isInternationalShipment check:", {
        source: source
          ? {
              type: source.type,
              country: source.data.country,
              hasOfficeId: !!source.data.officeId,
            }
          : null,
        destination: destination
          ? {
              type: destination.type,
              country: destination.data.country,
              hasOfficeId: !!destination.data.officeId,
            }
          : null,
      });

      if (!source || !destination) {
        console.log("Missing source or destination");
        return false;
      }

      // No verificar envíos internacionales para warehouse
      if (source.type === "warehouse" || destination.type === "warehouse") {
        console.log("Source or destination is warehouse, not international");
        return false;
      }

      let sourceCountry: string | null = null;
      let destinationCountry: string | null = null;

      sourceCountry = source.data.country || null;
      destinationCountry = destination.data.country || null;

      console.log("Countries comparison:", {
        sourceType: source.type,
        destinationType: destination.type,
        sourceCountry,
        destinationCountry,
        sourceData: source.data,
        destinationData: destination.data,
      });

      if (!sourceCountry || !destinationCountry) {
        console.log("Missing country data");
        return false;
      }

      const isInternational =
        sourceCountry.toUpperCase() !== destinationCountry.toUpperCase();

      console.log("Is international shipment?", isInternational);

      return isInternational;
    };
  }, []);

  const getCountryFromEntity = (
    entity: ValidationEntity | null
  ): string | null => {
    if (!entity) return null;
    return entity.data.country || null;
  };

  const getLocationName = (entity: ValidationEntity | null): string => {
    if (!entity) return "Unknown";

    if (entity.type === "member") {
      return `${entity.data.firstName} ${entity.data.lastName}`;
    } else if (entity.type === "office") {
      return entity.data.location || "Office";
    } else if (entity.type === "warehouse") {
      return entity.data.location || "Warehouse";
    }

    return "Unknown";
  };

  return {
    isInternationalShipment,
    getCountryFromEntity,
    getLocationName,
    buildInternationalValidationEntities,
  };
};
