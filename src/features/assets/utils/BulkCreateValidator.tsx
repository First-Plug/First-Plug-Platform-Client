"use client";
import { Button } from "@/shared";

import { User } from "@/features/auth";
import { Member } from "@/features/members";
import { useQueryClient } from "@tanstack/react-query";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useAsideStore } from "@/shared";
import { Office, useOffices } from "@/features/settings";
import { useMemberStore } from "@/features/members";

interface ExtendedUser extends Partial<User> {
  personalEmail?: string;
  dni?: string | number;
  firstName?: string;
  lastName?: string;
}

// Campos requeridos para shipments
const REQUIRED_FOR_SHIPMENTS = [
  "name",
  "phone",
  "country",
  "state",
  "city",
  "zipCode",
  "address",
] as const;

interface BulkCreateValidatorProps {
  productIndex: number;
  selectedMember: string;
  relocation: string;
  members: any[];
  onStatusChange: (status: string, index: number) => void;
  setAside: (view: string) => void;
  officeId?: string | null;
}

export const validateCompanyBillingInfo = (user: any): boolean => {
  const requiredFields = ["country", "city", "state", "zipCode", "address"];
  return requiredFields.every((field) => user[field]?.trim() !== "");
};

export const validateMemberInfo = (user: ExtendedUser): boolean => {
  // Mismos campos que en offboarding: country, city, zipCode, address, personalEmail, phone, dni
  const requiredFields = [
    "country",
    "city",
    "zipCode",
    "address",
    "personalEmail",
    "phone",
    "dni",
  ] as const;
  const isValid = requiredFields.every((field) => {
    const value = user[field as keyof ExtendedUser];
    return (
      value !== undefined &&
      value !== null &&
      (typeof value === "number" || value.toString().trim() !== "")
    );
  });
  return isValid;
};

export const validateOfficeComplete = (office: Office | undefined): boolean => {
  if (!office) return false;
  return REQUIRED_FOR_SHIPMENTS.every((field) => {
    const value = office[field as keyof Office];
    return value !== undefined && value !== null && String(value).trim() !== "";
  });
};

export const BulkCreateValidator: React.FC<BulkCreateValidatorProps> = ({
  productIndex,
  selectedMember,
  relocation,
  members,
  onStatusChange,
  setAside,
  officeId,
}) => {
  const { data: session } = useSession();
  const user = session?.user;
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isClosed } = useAsideStore();
  const { offices } = useOffices();
  const { setSelectedMember } = useMemberStore();

  const [status, setStatus] = useState<string>("none");
  const [selectedOfficeForUpdate, setSelectedOfficeForUpdate] =
    useState<Office | null>(null);

  // Función para calcular el status actual (similar a offboarding)
  const calculateStatus = (): string => {
    if (relocation === "Employee") {
      // Usar directamente el array members del prop (como en offboarding)
      const foundMember = members.find(
        (m) => `${m.firstName} ${m.lastName}` === selectedMember
      );

      if (!foundMember) {
        return "selectMembers";
      }
      if (!validateMemberInfo(foundMember)) {
        return "not-member-details";
      }
      return "valid";
    }

    // Validar si es una oficina (no "Employee" ni "Location")
    // En bulk create, cuando relocation es "Our office" o tiene officeId, es una oficina
    if (relocation && relocation !== "Employee" && relocation !== "Location") {
      if (officeId) {
        // Obtener oficinas del cache o del hook
        const cachedOffices =
          queryClient.getQueryData<Office[]>(["offices"]) || [];
        const allOffices =
          offices && offices.length > 0 ? offices : cachedOffices;

        const selectedOffice = allOffices.find((o) => o._id === officeId);

        if (selectedOffice) {
          setSelectedOfficeForUpdate(selectedOffice);
          if (!validateOfficeComplete(selectedOffice)) {
            return "not-office-complete";
          }
          if (!validateCompanyBillingInfo(user)) {
            return "not-company-details";
          }
          return "valid";
        } else {
          // Si hay officeId pero no se encuentra la oficina, puede que aún no se haya cargado
          // Retornar "none" para que se revalide cuando se carguen las oficinas
          return "none";
        }
      } else if (relocation === "Our office") {
        // Si es "Our office" pero no hay officeId, validar company billing info
        if (!validateCompanyBillingInfo(user)) {
          return "not-company-details";
        }
      }
    }

    return "none";
  };

  // Revalidar cuando cambian las dependencias (igual que en offboarding)
  useEffect(() => {
    const newStatus = calculateStatus();
    setStatus((prevStatus) => {
      if (newStatus !== prevStatus) {
        onStatusChange(newStatus, productIndex);
        return newStatus;
      }
      return prevStatus;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMember, relocation, members, officeId, offices, user]);

  const handleClick = () => {
    if (status === "not-company-details") {
      router.push("/home/settings");
    } else if (status === "not-member-details") {
      // Usar directamente el array members del prop (como en offboarding)
      const foundMember = members.find(
        (m) => `${m.firstName} ${m.lastName}` === selectedMember
      );
      if (foundMember) {
        setSelectedMember(foundMember);
        setAside("EditMember");
      }
    } else if (status === "not-office-complete" && selectedOfficeForUpdate) {
      queryClient.setQueryData(["selectedOffice"], selectedOfficeForUpdate);
      setAside("UpdateOffice");
    }
  };

  return (
    <div className="mt-6 p-2">
      <div className="flex items-center space-x-2">
        {status === "not-company-details" && (
          <Button
            onClick={handleClick}
            className="w-auto max-w-xs text-center whitespace-normal"
          >
            Complete Company Details
          </Button>
        )}
        {status === "not-member-details" && (
          <Button
            onClick={handleClick}
            className="w-auto max-w-xs text-center whitespace-normal"
          >
            Complete Member Details
          </Button>
        )}
        {status === "not-office-complete" && (
          <Button
            onClick={handleClick}
            className="w-auto max-w-xs text-center whitespace-normal"
            variant="primary"
          >
            Complete Office Details
          </Button>
        )}
      </div>
    </div>
  );
};
