"use client";
import { Button } from "@/common";
import { useStore } from "@/models";
import { Product, User } from "@/types";
import { usePrefetchAssignData } from "@/assets/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useSession } from "next-auth/react";
import GenericAlertDialog from "@/components/AddProduct/ui/GenericAlertDialog";
import { useRouter } from "next/navigation";
import { validateBillingInfo } from "@/lib/utils";

type ActionType = {
  text: string;
  action: () => void;
};

interface ActionButtonProps {
  product: Product;
}
export function ActionButton({ product }: ActionButtonProps) {
  const {
    aside: { setAside, closeAside },
    members: { setSelectedMemberEmail },
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

  const { data: session } = useSession();
  const router = useRouter();

  const handleAssignAction = () => {
    if (product.location === "Our office") {
      if (!validateBillingInfo(session.user).isValid) {
        setMissingOfficeData(validateBillingInfo(session.user).missingFields);
        return setShowErrorDialogOurOffice(true);
      }
    }

    const cachedProduct = queryClient.getQueryData<Product>([
      "assets",
      product._id,
    ]);

    setAside("AssignProduct");
    setSelectedMemberEmail("");

    setProductToAssing(cachedProduct || product);
  };

  const handleReassignAction = () => {
    const cachedProduct = queryClient.getQueryData<Product>([
      "assets",
      product._id,
    ]);

    setAside("ReassignProduct");
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
          closeAside();
          router.push(`/home/settings`);
          setShowErrorDialogOurOffice(false);
        }}
      />
      <div
        onMouseEnter={() => {
          prefetchAssignData();
        }}
      >
        <Button onClick={action} className="rounded-md" variant="text">
          {text}
        </Button>
      </div>
    </>
  );
}
