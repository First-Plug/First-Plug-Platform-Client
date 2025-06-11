"use client";
import { Button, TrashIcon } from "@/shared";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Loader,
} from "@/shared";
import { useState } from "react";
import {
  useDeleteMember,
  useFetchMember,
  useFetchMembers,
} from "@/features/members";
import { useQueryClient } from "@tanstack/react-query";
import { useRemoveFromTeam } from "@/features/teams";
import { useDeleteAsset, usePrefetchAsset } from "@/features/assets";
import { useCancelShipment } from "@/features/shipments";
import { Member } from "@/features/members";
import { useAlertStore } from "@/shared";

type DeleteTypes =
  | "product"
  | "member"
  | "team"
  | "memberUnassign"
  | "shipment";

type ConfigType = {
  title: string;
  description?: string;
  deleteAction: () => void;
};

interface DeleteAlertProps {
  type: DeleteTypes;
  id: string;
  disabled?: boolean;
  teamId?: string;
  onConfirm?: () => void;
  trigger?: React.ReactNode;
}
export const DeleteAction = ({
  type,
  id,
  onConfirm,
  trigger,
  teamId,
  disabled,
}: DeleteAlertProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const deleteMemberMutation = useDeleteMember();
  const removeFromTeamMutation = useRemoveFromTeam();
  const deleAssetMutation = useDeleteAsset();
  const cancelShipmentMutation = useCancelShipment();

  const { setAlert } = useAlertStore();

  const queryClient = useQueryClient();
  const { prefetchAsset } = usePrefetchAsset();
  const { data: membersData } = useFetchMembers();

  const { data: memberData } = useFetchMember(
    type === "member" ? id : undefined
  );

  const checkMemberProducts = () => {
    if (!memberData) return false;

    const hasRecoverableProducts = memberData.products.some(
      (product) => product.recoverable
    );

    return !hasRecoverableProducts;
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      if (!id) throw new Error("Product ID is undefined");

      const product = await prefetchAsset(id);
      if (product.activeShipment) {
        setAlert("shipmentCancelAssetError");
        return;
      }

      setLoading(true);

      await deleAssetMutation.mutateAsync(id, {
        onSuccess: () => {
          setOpen(false);
          setAlert("deleteStock");
          setLoading(false);
        },
        onError: (error) => {
          setLoading(false);
        },
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      setOpen(false);
      setLoading(false);
    }
  };

  const handleDeleteMember = async () => {
    try {
      if (!id) {
        throw new Error("Member ID is undefined");
      }

      const member = queryClient.getQueryData<Member>(["members", id]);
      if (member.activeShipment) {
        setAlert("shipmentCancelMemberError");
        return;
      }

      const canDelete = await checkMemberProducts();

      if (!canDelete) {
        setAlert("errorRecoverableStock");
        return;
      }
      setLoading(true);

      await deleteMemberMutation.mutateAsync(id, {
        onSuccess: () => {
          setOpen(false);
          setAlert("deleteMember");
          setLoading(false);
        },
        onError: (error) => {
          setLoading(false);
        },
      });
    } catch (error) {
      setOpen(false);
      setLoading(false);
    }
  };

  const checkIfTeamHasMembers = async (teamId: string) => {
    if (!membersData) return false;
    const teamMembers = membersData?.filter(
      (member) =>
        member.team &&
        typeof member.team === "object" &&
        member.team._id === teamId
    );
    return teamMembers && teamMembers.length > 0;
  };

  const handleDeleteTeam = async () => {
    if (onConfirm) {
      onConfirm();
      setOpen(false);
    }
  };

  const handleTriggerClick = async () => {
    if (type === "team") {
      const hasMembers = await checkIfTeamHasMembers(id);
      if (hasMembers) {
        setAlert("errorDeleteTeamWithMembers");
        return;
      }
    }
    if (type === "product") {
      try {
        await prefetchAsset(id);
      } catch (error) {
        console.error(`Error al prefetch del producto ${id}:`, error);
      }
    }
    setOpen(true);
  };

  const handleUnassignMember = async () => {
    if (!id || !teamId) {
      throw new Error("Member ID or Team ID is undefined");
    }

    setLoading(true);

    await removeFromTeamMutation.mutateAsync(
      { memberId: id, teamId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["members"] });
          queryClient.invalidateQueries({ queryKey: ["teams"] });
          setOpen(false);
          setAlert("memberUnassigned");
          setLoading(false);
          if (onConfirm) {
            onConfirm();
          }
        },
        onError: (error) => {
          console.error("Error removing member from team:", error);
          setLoading(false);
          setOpen(false);
        },
      }
    );
  };

  const handleDeleteShipment = async () => {
    if (!id) {
      throw new Error("id is undefined");
    }

    await cancelShipmentMutation.mutateAsync(id, {
      onSuccess: () => {
        setOpen(false);
        setLoading(false);
        setAlert("deleteShipment");
      },
      onError: (error) => {
        console.error("Error deleting shipment:", error);
        setOpen(false);
        setLoading(false);
      },
    });

    setLoading(true);
  };

  const DeleteConfig: Record<DeleteTypes, ConfigType> = {
    product: {
      title: "Are you sure you want to delete this product? 🗑️",
      description: "This product will be permanently deleted",
      deleteAction: () => handleDeleteProduct(id),
    },
    member: {
      title: " Are you sure you want to delete this member from your team? 🗑️",
      description: " This member will be permanently deleted",
      deleteAction: handleDeleteMember,
    },
    team: {
      title: "Are you sure you want to delete this team? 🗑️",
      description: "This team will be permanently deleted",
      deleteAction: handleDeleteTeam,
    },
    memberUnassign: {
      title: "Are you sure you want to unassign this member? 🗑️",
      description: "This member will be unassigned from the team",
      deleteAction: handleUnassignMember,
    },
    shipment: {
      title: "Are you sure you want to delete this shipment? 🗑️",
      description: "This shipment will be permanently deleted",
      deleteAction: handleDeleteShipment,
    },
  };
  const { title, description, deleteAction } = DeleteConfig[type];
  return (
    <>
      <Dialog open={open}>
        <DialogTrigger onClick={handleTriggerClick} disabled={disabled}>
          {trigger ? (
            trigger
          ) : (
            <TrashIcon
              className={`w-[1.2rem] h-[1.2rem] ${
                disabled ? "text-disabled" : "text-error hover:text-error/70"
              }`}
              strokeWidth={2}
            />
          )}
        </DialogTrigger>
        {!loading ? (
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-xl">{title}</DialogTitle>
              <DialogDescription className="font-normal text-md">
                {description}
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center gap-2 mt-4">
              <Button
                variant="secondary"
                onClick={() => setOpen(false)}
                className="w-full"
              >
                Cancel
              </Button>
              <Button
                disabled={loading}
                variant="delete"
                onClick={deleteAction}
                className="bg-error w-full"
              >
                <p>Delete</p>
              </Button>
            </div>
          </DialogContent>
        ) : (
          <DialogContent>
            <Loader />
          </DialogContent>
        )}
      </Dialog>
    </>
  );
};
