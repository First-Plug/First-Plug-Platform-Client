"use client";
import { Button, TrashIcon } from "@/common";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Memberservices, ProductServices, TeamServices } from "@/services";
import { useStore } from "@/models/root.store";
import { observer } from "mobx-react-lite";
import { Loader } from "../Loader";
import useFetch from "@/hooks/useFetch";
import {
  useDeleteMember,
  useFetchMember,
  useFetchMembers,
} from "@/members/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { useRemoveFromTeam } from "@/teams/hooks";
import { usePrefetchAsset } from "@/assets/hooks";

type DeleteTypes = "product" | "member" | "team" | "memberUnassign";

type ConfigType = {
  title: string;
  description?: string;
  deleteAction: () => void;
};

interface DeleteAlertProps {
  type: DeleteTypes;
  id: string;
  teamId?: string;
  onConfirm?: () => void;
  trigger?: React.ReactNode;
}
export const DeleteAction: React.FC<DeleteAlertProps> = observer(
  ({ type, id, onConfirm, trigger, teamId }) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const deleteMemberMutation = useDeleteMember();
    const removeFromTeamMutation = useRemoveFromTeam();

    const {
      products: { deleteProduct },
      alerts: { setAlert },
    } = useStore();

    const { fetchStock } = useFetch();
    const queryClient = useQueryClient();
    const { prefetchAsset } = usePrefetchAsset();
    const { data: membersData } = useFetchMembers();
    let memberData;
    if (type === "member") {
      const { data, isLoading: isLoadingMember } = useFetchMember(id);
      memberData = data;
    }

    const checkMemberProducts = () => {
      if (!memberData) return false;

      const hasRecoverableProducts = memberData.products.some(
        (product) => product.recoverable
      );

      return !hasRecoverableProducts;
    };

    const handleDeleteProduct = async () => {
      try {
        if (!id) {
          throw new Error("Product ID is undefined");
        }

        setLoading(true);
        await ProductServices.deleteProduct(id);
        deleteProduct(id);
        await fetchStock();
        queryClient.invalidateQueries({ queryKey: ["members"] });
        setOpen(false);
        setLoading(false);
        setAlert("deleteStock");
      } catch (error) {
        setOpen(false);
      }
    };

    const handleDeleteMember = async () => {
      try {
        if (!id) {
          throw new Error("Member ID is undefined");
        }
        const canDelete = await checkMemberProducts();

        if (!canDelete) {
          setAlert("errorRecoverableStock");
          return;
        }
        setLoading(true);

        // Uso la mutacion para no hacer una recarga completa
        deleteMemberMutation.mutate(id, {
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
          console.log(`Producto ${id} pre-fetched con éxito`);
        } catch (error) {
          console.error(`Error al prefetch del producto ${id}:`, error);
        }
      }
      setOpen(true);
    };

    const handleUnassignMember = () => {
      if (!id || !teamId) {
        throw new Error("Member ID or Team ID is undefined");
      }

      setLoading(true);

      removeFromTeamMutation.mutate(
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

    const DeleteConfig: Record<DeleteTypes, ConfigType> = {
      product: {
        title: " Are you sure you want to delete this product? 🗑️",
        description: "This product will be permanently deleted",
        deleteAction: handleDeleteProduct,
      },
      member: {
        title:
          " Are you sure you want to delete this member from your team? 🗑️",
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
    };
    const { title, description, deleteAction } = DeleteConfig[type];
    return (
      <>
        <Dialog open={open}>
          <DialogTrigger onClick={handleTriggerClick}>
            {trigger ? (
              trigger
            ) : (
              <TrashIcon
                className="text-dark-grey w-[1.2rem] h-[1.2rem] hover:text-error"
                strokeWidth={2}
              />
            )}
          </DialogTrigger>
          {!loading ? (
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-xl">{title}</DialogTitle>
                <DialogDescription className="text-md font-normal">
                  {description}
                </DialogDescription>
              </DialogHeader>
              <DialogDescription className="text-md">
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => setOpen(false)}
                    className="w-full"
                  >
                    <p>Cancel</p>
                  </Button>
                  <Button
                    disabled={loading}
                    variant="delete"
                    onClick={deleteAction}
                    className="w-full bg-error"
                  >
                    <p>Delete</p>
                  </Button>
                </div>
              </DialogDescription>
            </DialogContent>
          ) : (
            <DialogContent>
              <Loader />
            </DialogContent>
          )}
        </Dialog>
      </>
    );
  }
);
