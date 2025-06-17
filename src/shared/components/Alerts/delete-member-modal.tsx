"use client";
import { Button } from "@/shared";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared";
import { useState } from "react";
import { Memberservices } from "@/features/members";
import { Loader, useAlertStore } from "@/shared";
import { useQueryClient } from "@tanstack/react-query";

interface DeleteAlertProps {
  id: string;
  isOpen: boolean;
  setOpen: (boolean: boolean) => void;
  type: "NoRecoverable" | "NoProduct" | "None";
}
export const DeleteMemberModal = ({
  id,
  isOpen,
  setOpen,
  type,
}: DeleteAlertProps) => {
  const [loading, setLoading] = useState(false);
  const { setAlert } = useAlertStore();

  const queryClient = useQueryClient();

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
      await Memberservices.deleteMember(id.toString());
      queryClient.invalidateQueries({ queryKey: ["members"] });
      setOpen(false);
      setAlert("deleteMember");
      setLoading(false);
    } catch (error) {
      setOpen(false);
      setLoading(false);
    }
  };

  const informationView = {
    NoRecoverable: {
      title:
        "There are no products to retrieve, and the member will be removed from your team.",
      description: "This member has no recoverable products.",
    },
    NoProduct: {
      title:
        "There are no products to retrieve, and the member will be removed from your team.",
      description: "This member has no products assigned.",
    },
    None: {
      title: "Are you sure you want to delete this member? 🗑️",
      description: "This member will be permanently deleted",
    },
  };

  return (
    <>
      <Dialog open={isOpen}>
        {!loading ? (
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-xl">
                {informationView[type].title}
              </DialogTitle>
              <DialogDescription className="font-normal text-md">
                {informationView[type].description}
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
                  onClick={handleDeleteMember}
                  className="bg-error w-full"
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
};
