"use client";
import { Button } from "@/shared";

import { User } from "@/features/auth";
import { Member } from "@/features/members";
import { useQueryClient } from "@tanstack/react-query";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAsideStore } from "@/shared";

interface ExtendedUser extends Partial<User> {
  personalEmail?: string;
  dni?: string | number;
  firstName?: string;
  lastName?: string;
}

interface BulkCreateValidatorProps {
  productIndex: number;
  selectedMember: string;
  relocation: string;
  members: any[];
  onStatusChange: (status: string, index: number) => void;
  setAside: (view: string) => void;
}

export const validateCompanyBillingInfo = (user: any): boolean => {
  const requiredFields = ["country", "city", "state", "zipCode", "address"];
  return requiredFields.every((field) => user[field]?.trim() !== "");
};

export const validateMemberInfo = (user: ExtendedUser): boolean => {
  const requiredFields = [
    "country",
    "city",
    "zipCode",
    "address",
    // "apartment",
    "personalEmail",
    "phone",
    "dni",
  ];
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

export const BulkCreateValidator: React.FC<BulkCreateValidatorProps> = ({
  productIndex,
  selectedMember,
  relocation,
  members,
  onStatusChange,
  setAside,
}) => {
  const { data: session } = useSession();
  const user = session?.user;
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isClosed } = useAsideStore();

  const [status, setStatus] = useState<string>("none");
  const [isUpdatingMember, setIsUpdatingMember] = useState(false);

  useEffect(() => {
    if (isClosed) {
      revalidateStatus();
    }
  }, [isClosed]);

  useEffect(() => {
    if (isClosed) {
      queryClient.invalidateQueries({ queryKey: ["members"] }).then(() => {
        queryClient.refetchQueries({ queryKey: ["members"] }).then(() => {
          const updatedMembers = queryClient.getQueryData<Member[]>([
            "members",
          ]);

          if (updatedMembers) {
            queryClient.setQueryData(["members"], updatedMembers);
          }
          revalidateStatus();
        });
      });
    }
  }, [isClosed]);

  useEffect(() => {
    revalidateStatus();
  }, [selectedMember, relocation, members]);

  const revalidateStatus = () => {
    const updatedMembers =
      queryClient.getQueryData<Member[]>(["members"]) || [];

    const foundMember = updatedMembers.find(
      (m) =>
        `${m.firstName} ${m.lastName}`.trim().toLowerCase() ===
        selectedMember.trim().toLowerCase()
    );

    let newStatus = "none";

    if (relocation === "Employee") {
      if (!foundMember) {
        newStatus = "selectMembers";
      } else if (!validateMemberInfo(foundMember)) {
        newStatus = "not-member-details";
      } else {
        newStatus = "valid";
      }
    } else if (
      relocation &&
      relocation !== "Employee" &&
      !validateCompanyBillingInfo(user)
    ) {
      // Si el location es una oficina (no "Employee"), validar company billing info
      newStatus = "not-company-details";
    }

    if (newStatus !== status) {
      setStatus(newStatus);
      onStatusChange(newStatus, productIndex);
    }
  };

  useEffect(() => {
    if (members.length > 0 && selectedMember) {
      revalidateStatus();
    }
  }, [members, selectedMember]);

  useEffect(() => {
    if (isClosed && isUpdatingMember) {
      revalidateStatus();
      setIsUpdatingMember(false);
    }
  }, [isClosed, isUpdatingMember]);

  const handleClick = () => {
    if (status === "not-company-details") {
      router.push("/home/settings");
    } else if (status === "not-member-details") {
      const foundMember = members.find(
        (m) => `${m.firstName} ${m.lastName}` === selectedMember
      );
      queryClient.setQueryData(["selectedMember"], foundMember?._id);
      setAside("EditMember");
      setIsUpdatingMember(true);
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
      </div>
    </div>
  );
};
