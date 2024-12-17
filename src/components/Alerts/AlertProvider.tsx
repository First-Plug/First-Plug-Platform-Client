"use client";
import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useStore } from "@/models";
import { observer } from "mobx-react-lite";
import { AlertType } from "@/types/alerts";
import { useRouter } from "next/navigation";
import { XCircleIcon } from "lucide-react";
import { CheckIcon } from "@/common";
import useFetch from "@/hooks/useFetch";
import { useQueryClient } from "@tanstack/react-query";
import { TeamMember } from "@/types";

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
    members,
    alerts: { alertType, setAlert },
    aside: { setAside },
  } = useStore();
  const router = useRouter();
  const { fetchMembers, fetchStock } = useFetch();
  const queryClient = useQueryClient();

  const Config: Record<AlertType, IConfig> = {
    memberMissingFields: {
      title: "Error",
      type: "error",
      description: "No products to recover.",
      closeAction: () => {
        setAlert(undefined);
      },
    },
    noProductsToRecover: {
      title: "Error",
      type: "error",
      description: "No products to recover.",
      closeAction: () => {
        setAlert(undefined);
      },
    },
    ErorPasswordChange: {
      title: "Error",
      type: "error",
      description: "Please verify your credentials.",
      closeAction: () => {
        setAlert(undefined);
      },
    },
    passwordChange: {
      title: "Success",
      type: "succes",
      description: "Password has been successfully changed.",
      closeAction: () => {
        setAlert(undefined);
      },
    },
    missingBrandOrModel: {
      title: "Error",
      type: "error",
      description: "Brand and Model are required.",
      closeAction: () => {
        setAlert(undefined);
      },
    },
    userUpdatedSuccesfully: {
      title: "Success",
      type: "succes",
      description: " User has been successfully updated.",
      closeAction: () => {
        setAlert(undefined);
      },
    },
    recoverableConfigUpdated: {
      title: "Success",
      type: "succes",
      description: "Recoverable configuration has been successfully updated.",
      closeAction: () => {
        setAlert(undefined);
      },
    },
    dataUpdatedSuccessfully: {
      title: "Success",
      type: "succes",
      description: " Data has been successfully updated.",
      closeAction: () => {
        setAlert(undefined);
      },
    },
    removeItemSuccesfully: {
      title: "Success",
      type: "succes",
      description: " Product has been successfully removed.",
      closeAction: () => {
        setAlert(undefined);
        router.push("/home/my-stock");
      },
    },
    memberUnassigned: {
      title: "Success",
      type: "succes",
      description: " Member  successfully unassigned.",
      closeAction: () => {
        setAlert(undefined);
      },
    },
    assignedProductSuccess: {
      title: "Success",
      type: "succes",
      description: " Product successfully assigned.",
      closeAction: () => {
        queryClient.invalidateQueries({ queryKey: ["members"] });
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
      description: " The csv file has been successfully uploaded.",
      closeAction: () => {
        setAlert(undefined);
      },
    },
    updateMember: {
      title: " Success",
      type: "succes",
      description: " This member has been successfully updated.",
      closeAction: async () => {
        queryClient.invalidateQueries({ queryKey: ["members"] });
        queryClient.invalidateQueries({ queryKey: ["assets"] });
        // await fetchStock();
        setAside(undefined);
        setAlert(undefined);
      },
    },
    updateStock: {
      title: " Success",
      type: "succes",
      description: " Your product has been successfully updated.",
      closeAction: async () => {
        queryClient.invalidateQueries({ queryKey: ["members"] });
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
      description: " This Member has been successfully added to your team.",
      closeAction: async () => {
        queryClient.invalidateQueries({ queryKey: ["members"] });
        setAlert(undefined);
        router.push("/home/my-team");
      },
    },
    createProduct: {
      title: " Success",
      type: "succes",
      description: " Your product has been successfully created.",
      closeAction: async () => {
        queryClient.invalidateQueries({ queryKey: ["assets"] });
        // await fetchStock();
        setAlert(undefined);
        router.push("/home/my-stock");
      },
    },
    createTeam: {
      title: " Success",
      type: "succes",
      description: " Your team has been successfully created.",
      closeAction: () => {
        setAlert(undefined);
      },
    },
    deleteMember: {
      title: " Success",
      type: "succes",
      description: " The member has been successfully deleted.",
      closeAction: () => {
        setAside(undefined);
        setAlert(undefined);
      },
    },
    deleteTeam: {
      title: " Success",
      type: "succes",
      description: " The team has been successfully deleted.",
      closeAction: () => {
        setAlert(undefined);
      },
    },
    deleteStock: {
      title: " Success",
      type: "succes",
      description: " The product has been successfully deleted.",
      closeAction: () => {
        // queryClient.invalidateQueries({ queryKey: ["assets"] });
        setAlert(undefined);
      },
    },
    errorDeleteTeamWithMembers: {
      title: " Error",
      type: "error",
      description:
        " Cannot delete a team with members. Please unassign the members first.",
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
    errorDniInUse: {
      title: "Error",
      type: "error",
      description: "DNI is already in use",
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
        router.push("/home/my-stock");
      },
    },
    errorDeleteMember: {
      title: " Error",
      type: "error",
      description: "There was an error deleting this member. Please try again.",
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
    bulkCreateProductSuccess: {
      title: "Success",
      type: "succes",
      description: "Products have been successfully created.",
      closeAction: async () => {
        queryClient.invalidateQueries({ queryKey: ["assets"] });
        // await fetchStock();
        setAlert(undefined);
        router.push("/home/my-stock");
      },
    },
    bulkCreateProductError: {
      title: "Error",
      type: "error",
      description:
        "There was an error creating the products. Please try again.",
      closeAction: () => {
        setAlert(undefined);
      },
    },
    bulkCreateSerialNumberError: {
      title: "Error",
      type: "error",
      description: "Serial Number already exists for one or more products.",
      closeAction: () => {
        setAlert(undefined);
      },
    },
    birthdayGiftAlert: {
      title: "Birthday Gifts",
      type: "succes",
      description:
        "We will contact you shortly to share our gifts for your team.",
      closeAction: () => {
        setAlert(undefined);
      },
    },
    computerUpgradeAlert: {
      title: "Upgrade Request Received",
      type: "succes",
      description:
        "Thank you for your request. We will be in touch with you shortly to proceed with the next steps.",
      closeAction: () => {
        setAlert(undefined);
      },
    },
    successOffboarding: {
      title: "Offboarding Successful",
      type: "succes",
      description:
        "The member has been removed from My Team, and their products have been reassigned successfully.",
      closeAction: () => {
        setAlert(undefined);
      },
    },
    errorOffboarding: {
      title: "Offboarding Error",
      type: "error",
      description:
        "An error occurred while trying to remove the member or reassign their products. Please try again.",
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
            <span className="font-semibold text-black text-2xl">{title}</span>
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
