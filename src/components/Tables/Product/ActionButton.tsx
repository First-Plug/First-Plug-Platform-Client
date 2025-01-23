"use client";
import { Button } from "@/common";
import { useStore } from "@/models";
import { Product } from "@/types";
import { usePrefetchAssignData } from "@/assets/hooks";
import { useQueryClient } from "@tanstack/react-query";

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

  const handleReassignAction = () => {
    // await queryClient.invalidateQueries({ queryKey: ["assets", product._id] });

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
    Unavailable: {
      text: "Reassign",
      action: handleReassignAction,
    },
  };
  const { action, text } = ActionConfig[product.status];

  return (
    <div
      onMouseEnter={async () => {
        await queryClient.invalidateQueries({
          queryKey: ["assets", product._id],
        });
        prefetchAssignData();
      }}
    >
      <Button onClick={action} className="rounded-md" variant="text">
        {text}
      </Button>
    </div>
  );
}
