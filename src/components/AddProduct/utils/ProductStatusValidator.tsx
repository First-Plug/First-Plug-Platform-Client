import { Button } from "@/common";
import { useStore } from "@/models";
import { User } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
  console.log("Validating user billing info:", user);
  const result = requiredFields.every((field) => user[field]?.trim() !== "");
  console.log("Billing info valid:", result);
  return result;
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
  const isValid = requiredFields.every((field) => {
    const value = user[field as keyof ExtendedUser];

    const fieldValid =
      value !== undefined &&
      value !== null &&
      (typeof value === "number" || value.toString().trim() !== "");

    return fieldValid;
  });

  return isValid;
};

const ProductStatusValidator: React.FC<ProductStatusValidatorProps> = observer(
  ({
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
    const {
      aside: { isClosed },
    } = useStore();
    const router = useRouter();
    const [status, setStatus] = useState<string>("none");
    const [isUpdatingMember, setIsUpdatingMember] = useState(false);
    const queryClient = useQueryClient();

    useEffect(() => {
      if (isClosed) {
        revalidateStatus();
      }
    }, [isClosed]);

    useEffect(() => {
      if (isClosed) {
        queryClient.invalidateQueries({ queryKey: ["members"] }).then(() => {
          queryClient.refetchQueries({ queryKey: ["members"] }).then(() => {
            const updatedMembers = queryClient.getQueryData(["members"]);
            revalidateStatus();
          });
        });
      }
    }, [isClosed]);

    useEffect(() => {
      revalidateStatus();
    }, [selectedMember, relocation, members]);

    const revalidateStatus = () => {
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
        if (!foundMember) {
          newStatus = "selectMembers";
        } else if (!validateMemberBillingInfo(foundMember)) {
          newStatus = "not-member-available";
        } else {
          newStatus = "valid";
        }
      } else if (relocation === "Our office" && !validateBillingInfo(user)) {
        newStatus = "not-billing-information";
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
      if (status === "not-billing-information") {
        router.push("/home/settings");
      } else if (status === "not-member-available") {
        const foundMember = members.find(
          (m) => `${m.firstName} ${m.lastName}` === selectedMember
        );
        setMemberToEdit(foundMember?._id);
        setAside("EditMember");
        setIsUpdatingMember(true);
      }
    };

    return (
      <div className="mt-6 p-2">
        <div className="flex items-center space-x-2">
          {status === "not-billing-information" && (
            <Button
              size="default"
              onClick={handleClick}
              className="w-auto max-w-xs whitespace-normal text-center"
            >
              Complete Company Details
            </Button>
          )}
          {status === "not-member-available" && (
            <Button
              size="default"
              onClick={handleClick}
              className="w-auto max-w-xs whitespace-normal text-center"
            >
              Complete Member Details
            </Button>
          )}
        </div>
      </div>
    );
  }
);

export default ProductStatusValidator;
