"use client";
import { Button } from "@/common";
import { useStore } from "@/models";
import { Product } from "@/types";
import { usePrefetchAssignData } from "@/assets/hooks";

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

  const { prefetchAssignData } = usePrefetchAssignData(product._id);

  const handleAssignAction = () => {
    setAside("AssignProduct");
    setSelectedMemberEmail("");
    setProductToAssing(product);
  };

  const handleReassignAction = () => {
    setAside("ReassignProduct");
    setSelectedMemberEmail(product.assignedEmail);
    setProductToAssing(product);
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
    <div onMouseEnter={prefetchAssignData}>
      <Button onClick={action} className="rounded-md" variant="text">
        {text}
      </Button>
    </div>
  );
}
