"use client";
import { Button } from "@/shared";

import type { Product } from "@/features/assets";
import { usePrefetchAssignData, GenericAlertDialog } from "@/features/assets";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAsideStore } from "@/shared";

type ActionType = {
  text: string;
  action: () => void;
};

interface ActionButtonProps {
  product: Product;
}
export function ActionButton({ product }: ActionButtonProps) {
  const { setAside } = useAsideStore();
  const queryClient = useQueryClient();
  const { prefetchAssignData } = usePrefetchAssignData(product._id);

  const handleAssignAction = () => {
    queryClient.setQueryData(["selectedProduct"], product);
    setAside("AssignProduct");
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleReassignAction = () => {
    if (product.assignedEmail && !product.assignedMember) {
      queryClient.setQueryData(["selectedProduct"], product);
      setIsModalOpen(true);
      return;
    }

    setAside("ReassignProduct");
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
      `/home/my-team/add?&email=${encodeURIComponent(assignedEmail)}`
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
