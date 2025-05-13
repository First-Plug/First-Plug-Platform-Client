"use client";
import { Button } from "@/common";
import { useStore } from "@/models";
import type { Product } from "@/types";
import { usePrefetchAssignData } from "@/assets/hooks";
import { useQueryClient } from "@tanstack/react-query";
import GenericAlertDialog from "@/components/AddProduct/ui/GenericAlertDialog";
import { useState } from "react";
import { useRouter } from "next/navigation";

type ActionType = {
  text: string;
  action: () => void;
};

interface ActionButtonProps {
  product: Product;
}
export function ActionButton({ product }: ActionButtonProps) {
  const {
    aside: { setAside },
    members: { setSelectedMemberEmail },
    products: {
      getProductForAssign,
      getProductForReassign,
      setProductToAssing,
    },
  } = useStore();
  const queryClient = useQueryClient();
  const { prefetchAssignData } = usePrefetchAssignData(product._id);

  const handleAssignAction = () => {
    // await queryClient.invalidateQueries({ queryKey: ["assets", product._id] });
    const cachedProduct = queryClient.getQueryData<Product>([
      "assets",
      product._id,
    ]);

    setAside("AssignProduct");
    setSelectedMemberEmail("");

    setProductToAssing(cachedProduct || product);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleReassignAction = () => {
    // await queryClient.invalidateQueries({ queryKey: ["assets", product._id] });

    if (product.assignedEmail && !product.assignedMember) {
      // Open modal
      setIsModalOpen(true);
      return;
    }

    const cachedProduct = queryClient.getQueryData<Product>([
      "assets",
      product._id,
    ]);

    setAside("ReassignProduct");
    setSelectedMemberEmail(product.assignedEmail);
    setProductToAssing(cachedProduct || product);
  };

  const handleShipmentAction = () => {
    if (product.shipmentId) {
      router.push(`/home/shipments?id=${product.shipmentId}`);
    } else {
      console.log("No shipment ID");
    }
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
    Unavailable: {
      text: "Reassign",
      action: handleReassignAction,
    },
    "In Transit": {
      text: "View Tracking",
      action: handleShipmentAction,
    },
    "In Transit - Missing Data": {
      text: "Review Shipment",
      action: handleShipmentAction,
    },
  };
  const { action, text } = ActionConfig[product.status];

  const router = useRouter();

  const handleButtonClick = () => {
    const assignedEmail = product.assignedEmail;

    router.push(
      `/home/my-team/addTeam?&email=${encodeURIComponent(assignedEmail)}`
    );
  };

  return (
    <div
      onMouseEnter={async () => {
        await queryClient.invalidateQueries({
          queryKey: ["assets", product._id],
        });
        prefetchAssignData();
      }}
    >
      <GenericAlertDialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={"Warning"}
        description={
          "Before reassigning this product, please add the current holder as a member."
        }
        buttonText="Add Member"
        onButtonClick={handleButtonClick}
        showCancelButton
      />

      <Button onClick={action} className="rounded-md" variant="text">
        {text}
      </Button>
    </div>
  );
}
