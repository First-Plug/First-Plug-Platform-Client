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

    const currentMemberData = allMembers.find(
      (member) => member.email === product.assignedEmail
    );

    if (currentMemberData) {
      source = { type: "member", data: currentMemberData };
    } else if (product.location === "Our office" && product.officeId) {
      const office = offices?.find((office) => office._id === product.officeId);
      if (office) {
        source = { type: "office", data: office };
      }
    } else if (product.location === "FP warehouse") {
      const warehouseCountry =
        product.countryCode || product.office?.officeCountryCode || null;

      source = {
        type: "warehouse",
        data: {
          country: warehouseCountry,
          location: "FP warehouse",
        },
      };
    } else if (product.location === "Our office" && !product.officeId) {
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
        },
      };
    }

    if (selectedMember) {
      destination = { type: "member", data: selectedMember };
    } else if (selectedOfficeId) {
      const office = offices?.find((office) => office._id === selectedOfficeId);
      if (office) {
        destination = { type: "office", data: office };
      }
    } else if (noneOption === "Our office") {
      destination = {
        type: "office",
        data: {
          country: sessionUser?.country || "US",
          location: "Our office",
        },
      };
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
    }

    return { source, destination };
  };

  const isInternationalShipment = useMemo(() => {
    return (
      source: ValidationEntity | null,
      destination: ValidationEntity | null
    ): boolean => {
      if (!source || !destination) {
        return false;
      }

      if (destination.type === "warehouse") {
        return false;
      }

      let sourceCountry: string | null = null;
      let destinationCountry: string | null = null;

      sourceCountry = source.data.country || null;

      destinationCountry = destination.data.country || null;

      if (!sourceCountry || !destinationCountry) {
        return false;
      }

      const isInternational =
        sourceCountry.toUpperCase() !== destinationCountry.toUpperCase();

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
