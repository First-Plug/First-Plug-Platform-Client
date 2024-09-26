"use client";
import { Button } from "@/common";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Memberservices } from "@/services";
import { useStore } from "@/models/root.store";
import { observer } from "mobx-react-lite";
import { Loader } from "../Loader";
import useFetch from "@/hooks/useFetch";

interface DeleteAlertProps {
  id: string;
  isOpen: boolean;
  setOpen: (boolean: boolean) => void;
  type: "NoRecoverable" | "NoProduct" | "None";
}
export const DeleteMemberModal: React.FC<DeleteAlertProps> = observer(
  ({ id, isOpen, setOpen, type }) => {
    const [loading, setLoading] = useState(false);
    const {
      alerts: { setAlert },
    } = useStore();
    const { fetchMembers } = useFetch();

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
        await fetchMembers();
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
        title: "There are no products to retrieve, and the member will be removed from your team.",
        description: "This member has no recoverable products.",
      },
      NoProduct: {
        title: "There are no products to retrieve, and the member will be removed from your team.",
        description: "This member has no products assigned",
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
                <DialogDescription className="text-md font-normal">
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
