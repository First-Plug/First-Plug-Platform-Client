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
import { Memberservices, ProductServices } from "@/services";
import { useStore } from "@/models/root.store";
import { observer } from "mobx-react-lite";
import { Loader } from "../Loader";
import useFetch from "@/hooks/useFetch";

type DeleteTypes = "product" | "member" | "team";

type ConfigType = {
  title: string;
  description?: string;
  deleteAction: () => void;
};

interface DeleteAlertProps {
  type: DeleteTypes;
  id: string;
  onConfirm?: () => void;
  trigger?: React.ReactNode;
}
export const DeleteAction: React.FC<DeleteAlertProps> = observer(
  ({ type, id, onConfirm, trigger }) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const {
      products: { deleteProduct },
      alerts: { setAlert },
    } = useStore();
    const { fetchStock, fetchMembers, fetchTeams } = useFetch();
    const checkMemberProducts = async () => {
      try {
        const member = await Memberservices.getOneMember(id);
        const hasRecoverableProducts = member.products.some(
          (product) => product.recoverable
        );

        if (hasRecoverableProducts) {
          return false;
        }

        return true;
      } catch (error) {
        return false;
      }
    };
    const handleDeleteProduct = async () => {
      try {
        if (!id) {
          throw new Error("Product ID is undefined");
        }

        setLoading(true);
        await ProductServices.deleteProduct(id);
        await fetchStock();
        deleteProduct(id);
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
        await Memberservices.deleteMember(id);
        await fetchMembers();
        setOpen(false);
        setAlert("deleteMember");
        setLoading(false);
      } catch (error) {
        setOpen(false);
        setLoading(false);
      }
    };

    const handleDeleteTeam = async () => {
      if (onConfirm) {
        onConfirm();
        setOpen(false);
      }
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
        description: " This member will be permanetly deleted",
        deleteAction: handleDeleteMember,
      },
      team: {
        title: "Are you sure you want to delete this team? 🗑️",
        description: "This team will be permanently deleted",
        deleteAction: handleDeleteTeam,
      },
    };
    const { title, description, deleteAction } = DeleteConfig[type];
    return (
      <>
        <Dialog open={open}>
          <DialogTrigger onClick={() => setOpen(true)}>
            {trigger ? (
              trigger
            ) : (
              <TrashIcon
                className="text-dark-grey w-[1.2rem] h-[1.2rem] hover:text-error"
                strokeWidth={2}
              />
            )}
            {/* <TrashIcon
              className=" text-dark-grey w-[1.2rem] h-[1.2rem] hover:text-error"
              strokeWidth={2}
            /> */}
          </DialogTrigger>
          {!loading ? (
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-xl   ">{title}</DialogTitle>
                <DialogTitle className="text-md font-normal">
                  {description}
                </DialogTitle>
              </DialogHeader>
              <DialogDescription className="text-md   ">
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => setOpen(false)}
                    className="w-full "
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
