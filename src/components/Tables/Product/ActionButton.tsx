"use client";
import { Button } from "@/common";
import { useStore } from "@/models";
import { Product, TeamMember, User } from "@/types";
import { usePrefetchAssignData } from "@/assets/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import GenericAlertDialog from "@/components/AddProduct/ui/GenericAlertDialog";
import { useRouter } from "next/navigation";
import {
  formatMissingFieldsMessage,
  getMissingFields,
  validateBillingInfo,
} from "@/lib/utils";
import { getSnapshot } from "mobx-state-tree";

type ActionType = {
  text: string;
  action: () => void;
};

interface ActionButtonProps {
  product: Product;
  assignedMember: string;
}
export function ActionButton({ product, assignedMember }: ActionButtonProps) {
  const {
    aside: { setAside, closeAside, context },
    members: { setSelectedMemberEmail, members },
    products: {
      getProductForAssign,
      getProductForReassign,
      setProductToAssing,
    },
  } = useStore();
  const queryClient = useQueryClient();
  const { prefetchAssignData } = usePrefetchAssignData(product._id);
  const [showErrorDialogOurOffice, setShowErrorDialogOurOffice] =
    useState(false);
  const [missingOfficeData, setMissingOfficeData] = useState("");
  const [currentMissingFields, setCurrentMissingFields] = useState<string[]>(
    []
  );
  const { data: session } = useSession();
  const router = useRouter();

  const handleAssignAction = () => {
    if (product.location === "Our office") {
      const { isValid, missingFields } = validateBillingInfo(session.user);

      if (!isValid) {
        const missingFieldsArray = missingFields
          .split(",")
          .map((field) => field.trim());

        setMissingOfficeData(missingFields);
        setCurrentMissingFields([...missingFieldsArray, "billing"]);
        return setShowErrorDialogOurOffice(true);
      }
    }

    const cachedProduct = queryClient.getQueryData<Product>([
      "assets",
      product._id,
    ]);

    setAside("AssignProduct", undefined, { stackable: true });
    setSelectedMemberEmail("");

    setProductToAssing(cachedProduct || product);
  };

  const handleReassignAction = () => {
    const cachedProduct = queryClient.getQueryData<Product>([
      "assets",
      product._id,
    ]);

    const currentProduct = cachedProduct || product;

    const assignedMember = members.find(
      (member) => member.email === currentProduct.assignedEmail
    );

    if (!assignedMember) {
      console.error("No se encontró el miembro asignado al producto.");
      return;
    }
    // setAssignedMember(assignedMember);

    const missingFields = getMissingFields({
      personalEmail: assignedMember.personalEmail,
      phone: assignedMember.phone,
      dni: assignedMember.dni,
      country: assignedMember.country,
      city: assignedMember.city,
      zipCode: assignedMember.zipCode,
      address: assignedMember.address,
    });

    if (missingFields.length > 0) {
      setMissingOfficeData(formatMissingFieldsMessage(missingFields));
      setShowErrorDialogOurOffice(true);
      return;
    }

    setAside("ReassignProduct", undefined, { stackable: true });
    setSelectedMemberEmail(product.assignedEmail);
    setProductToAssing(cachedProduct || product);
  };

  const ActionConfig: Record<Product["status"], ActionType> = {
    Available: {
      text: "Assign To",
      action: handleAssignAction,
    },
    Delivered: {
      text: "Reassign",
      action: handleReassignAction,
    },
    Deprecated: {
      text: "Deprecated",
      action: () => {},
    },
  };
  const { action, text } = ActionConfig[product.status];

  return (
    <>
      <GenericAlertDialog
        open={showErrorDialogOurOffice}
        onClose={() => setShowErrorDialogOurOffice(false)}
        title="Please complete the missing data"
        description={missingOfficeData}
        buttonText="Update"
        onButtonClick={() => {
          setShowErrorDialogOurOffice(false);

          closeAside();
          if (currentMissingFields.includes("billing")) {
            router.push("/home/settings");
          } else {
            const storeAssignedMember = members.find(
              (member) => member.email === assignedMember
            );

            if (storeAssignedMember) {
              setAside("EditMember", undefined, {
                memberToEdit: getSnapshot(storeAssignedMember),
              });
            } else {
              console.error(
                "No se pudo encontrar el miembro correspondiente a 'assignedMember'."
              );
            }
          }
        }}
      />
      <div
        onMouseEnter={() => {
          prefetchAssignData();
        }}
      >
        <Button
          onClick={() => {
            if (!members.length) {
              console.warn("Sincronizando datos del store...");
              prefetchAssignData().then(() => action());
            } else {
              action();
            }
          }}
          className="rounded-md"
          variant="text"
        >
          {text}
        </Button>
      </div>
    </>
  );
}
