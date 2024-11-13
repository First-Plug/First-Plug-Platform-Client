import { Button } from "@/common";
import { User } from "@/types";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface ExtendedUser extends Partial<User> {
  personalEmail?: string;
  dni?: string | number;
  firstName?: string;
  lastName?: string;
}

interface ProductStatusValidatorProps {
  productIndex: number;
  selectedMember: string;
  relocation: string;
  members: any[];
  onStatusChange: (status: string, index: number) => void;
  setMemberToEdit: (memberId: string) => void;
  setAside: (view: string) => void;
}

const validateBillingInfo = (user: User): boolean => {
  const requiredFields = ["country", "city", "state", "zipCode", "address"];
  return requiredFields.every((field) => user[field]?.trim() !== "");
};

export const validateMemberBillingInfo = (user: ExtendedUser): boolean => {
  const requiredFields = [
    "country",
    "city",
    "zipCode",
    "address",
    "personalEmail",
    "phone",
    "dni",
  ];
  return requiredFields.every((field) => {
    const value = user[field as keyof ExtendedUser];
    return (
      value !== undefined &&
      value !== null &&
      (typeof value === "number" || value.toString().trim() !== "")
    );
  });
};

const ProductStatusValidator: React.FC<ProductStatusValidatorProps> = ({
  productIndex,
  selectedMember,
  relocation,
  members,
  onStatusChange,
  setMemberToEdit,
  setAside,
}) => {
  const { data: session } = useSession();
  const user = session?.user;
  const [status, setStatus] = useState<string>("none");

  useEffect(() => {
    console.log("Estado inicial de status:", status);
  }, []);

  useEffect(() => {
    if (!selectedMember && !relocation) {
      setStatus("none");
      onStatusChange("none", productIndex);
      return;
    }

    const foundMember = members.find(
      (m) => `${m.firstName} ${m.lastName}` === selectedMember
    );
    let newStatus = "none";

    if (relocation === "Employee") {
      if (!foundMember) newStatus = "selectMembers";
      else if (!validateMemberBillingInfo(foundMember))
        newStatus = "not-member-available";
    } else if (relocation === "Our office" && !validateBillingInfo(user)) {
      newStatus = "not-billing-information";
    }

    if (newStatus !== status) {
      setStatus(newStatus);
      onStatusChange(newStatus, productIndex);
    }
  }, [
    selectedMember,
    relocation,
    members,
    user,
    productIndex,
    onStatusChange,
    status,
  ]);

  const handleClick = () => {
    if (status === "not-billing-information") {
      setAside("EditCompanyDetails");
    } else if (status === "not-member-available") {
      const foundMember = members.find(
        (m) => `${m.firstName} ${m.lastName}` === selectedMember
      );
      setMemberToEdit(foundMember?._id);
      setAside("EditMember");
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {status === "not-billing-information" && (
        <Button size="default" onClick={handleClick}>
          Complete Company Details
        </Button>
      )}
      {status === "not-member-available" && (
        <Button size="default" onClick={handleClick}>
          Complete Member Details
        </Button>
      )}
    </div>
  );
};

export default ProductStatusValidator;
