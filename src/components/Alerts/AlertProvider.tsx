"use client";
import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useStore } from "@/models";
import { observer } from "mobx-react-lite";
import { AlertType } from "@/types/alerts";
import { useRouter } from "next/navigation";
import { XCircleIcon } from "lucide-react";
import { CheckIcon } from "@/common";
import { Memberservices, ProductServices } from "@/services";
import useFetch from "@/hooks/useFetch";

function XIcon() {
  return <XCircleIcon className="text-white " size={40} />;
}
interface IConfig {
  title: string;
  description: string;
  type: "succes" | "error";
  closeAction: () => void;
}

export default observer(function AlertProvider() {
  const {
    alerts: { alertType, setAlert },
    aside: { setAside },
  } = useStore();
  const router = useRouter();
  const { fetchMembers, fetchStock } = useFetch();

  const Config: Record<AlertType, IConfig> = {
    removeItemSuccesfully: {
      title: "Success",
      type: "succes",
      description: " Product has been removed  successfully.",
      closeAction: () => {
        setAlert(undefined);
        router.push("/home/my-stock");
      },
    },
    memberUnassigned: {
      title: "Success",
      type: "succes",
      description: " Member unassigned successfully.",
      closeAction: () => {
        setAlert(undefined);
      },
    },
    assignedProductSuccess: {
      title: "Success",
      type: "succes",
      description: " Product assigned successfully.",
      closeAction: () => {
        setAlert(undefined);
      },
    },
    errorAssignedProduct: {
      title: "Error",
      type: "error",
      description: " An error occurred while assigning product",
      closeAction: () => {
        setAlert(undefined);
      },
    },
    csvSuccess: {
      title: "Congratulations!",
      type: "succes",
      description: " The csv file has been uploaded successfully.",
      closeAction: async () => {
        setAlert(undefined);
      },
    },
    updateMember: {
      title: " Success",
      type: "succes",
      description: " Your Member has been successfully updated to your team.",
      closeAction: async () => {
        await fetchMembers();
        await fetchStock();
        setAlert(undefined);
        setAside(undefined);
      },
    },
    updateStock: {
      title: " Success",
      type: "succes",
      description: " Your product has been successfully updated to your stock.",
      closeAction: async () => {
        await fetchStock();
        setAlert(undefined);
      },
    },
    updateTeam: {
      title: " Success",
      type: "succes",
      description: " Your team has been successfully updated.",
      closeAction: () => {
        setAlert(undefined);
      },
    },
    createMember: {
      title: " Success",
      type: "succes",
      description: " Your Member has been successfully added to your team.",
      closeAction: async () => {
        await fetchMembers();
        setAlert(undefined);
        router.push("/home/my-team");
      },
    },
    createProduct: {
      title: " Success",
      type: "succes",
      description: " Your product has been created successfully.",
      closeAction: async () => {
        await fetchStock();
        setAlert(undefined);
        router.push("/home/my-stock");
      },
    },
    createTeam: {
      title: " Success",
      type: "succes",
      description: " Your team has been created successfully.",
      closeAction: () => {
        setAlert(undefined);
        router.push("/home/my-team");
      },
    },
    deleteMember: {
      title: " Success",
      type: "succes",
      description: " The member has been successfully deleted.",
      closeAction: () => {
        setAlert(undefined);
        router.push("/home/my-team");
      },
    },
    deleteTeam: {
      title: " Success",
      type: "succes",
      description: " The team has been successfully deleted.",
      closeAction: () => {
        setAlert(undefined);
        router.push("/home/my-team");
      },
    },
    deleteStock: {
      title: " Success",
      type: "succes",
      description: " The product has been successfully deleted.",
      closeAction: () => {
        setAlert(undefined);
      },
    },
    errorUpdateTeam: {
      title: " Error",
      type: "error",
      description: " There was an error updating the team. Please try again.",
      closeAction: () => {
        setAlert(undefined);
      },
    },
    errorEmailInUse: {
      title: " Error",
      type: "error",
      description: " Email is already in use.",
      closeAction: () => {
        setAlert(undefined);
      },
    },
    errorCreateMember: {
      title: " Error",
      type: "error",
      description: " There was an error creating the member. Please try again.",
      closeAction: () => {
        setAlert(undefined);
      },
    },
    errorCreateTeam: {
      title: " Error",
      type: "error",
      description: " There was an error creating the team. Please try again.",
      closeAction: () => {
        setAlert(undefined);
      },
    },
    errorDeleteTeam: {
      title: " Error",
      type: "error",
      description: " There was an error deleting the team. Please try again.",
      closeAction: () => {
        setAlert(undefined);
      },
    },
    errorDeleteStock: {
      title: " Error",
      type: "error",
      description:
        " There was an error deleting the product. Please try again.",
      closeAction: () => {
        setAlert(undefined);
        router.push("/home/my-team");
      },
    },
    errorDeleteMember: {
      title: " Error",
      type: "error",
      description:
        "There was an error deleting this memeber. Please try again.",
      closeAction: () => {
        setAlert(undefined);
      },
    },
    errorRecoverableStock: {
      title: " Cannot Delete Member",
      type: "error",
      description:
        " Cannot delete a member with recoverable products assigned. Please unassign the products first.",
      closeAction: () => {
        setAlert(undefined);
      },
    },
  };

  if (!alertType) return null;
  const { description, title, closeAction, type } = Config[alertType];

  return (
    <Dialog.Root open={alertType !== undefined}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 z-50" />
        <Dialog.Content className="fixed bg-white p-6 rounded-md shadow-md top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-96">
          <Dialog.Title className="text-center flex justify-center flex-col items-center">
            {type === "succes" && (
              <div className="p-1 rounded-full bg-success/50 animate-pulse">
                <CheckIcon />
              </div>
            )}
            {type === "error" && (
              <div className=" rounded-full bg-error ">
                <XIcon />
              </div>
            )}
            <h2 className="font-semibold text-black text-2xl">{title}</h2>
          </Dialog.Title>
          <Dialog.Description className="text-lg text-center my-2 ">
            {description}
          </Dialog.Description>
          <div className="mt-4 flex justify-end">
            <Dialog.Close asChild>
              <button
                className="px-4 py-2 bg-blue text-white rounded"
                onClick={closeAction}
              >
                close
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
});
