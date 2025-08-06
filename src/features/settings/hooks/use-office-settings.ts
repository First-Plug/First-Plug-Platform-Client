import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { OfficeServices } from "../services/office.services";
import { Office, UpdateOffice } from "../types/settings.types";
import { useAlertStore } from "@/shared";

export const useOfficeSettings = () => {
  const queryClient = useQueryClient();
  const { setAlert } = useAlertStore();

  // Fetch office data
  const {
    data: office,
    isLoading,
    error,
  } = useQuery<Office>({
    queryKey: ["officeDefault"],
    queryFn: OfficeServices.getDefaultOffice,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Update office mutation
  const updateOfficeMutation = useMutation({
    mutationFn: (data: UpdateOffice) =>
      OfficeServices.updateDefaultOffice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["officeDefault"] });
      setAlert("dataUpdatedSuccessfully");
    },
    onError: (error) => {
      console.error("Error updating office:", error);
      setAlert("errorUpdateTeam");
    },
  });

  const updateOffice = (data: UpdateOffice) => {
    updateOfficeMutation.mutate(data);
  };

  return {
    office,
    isLoading,
    error,
    updateOffice,
    isUpdating: updateOfficeMutation.isPending,
  };
};
