import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserServices } from "../services/user.services";
import { TenantConfig, UpdateTenantConfig } from "../types/settings.types";
import { useAlertStore } from "@/shared";

export const useCompanySettings = () => {
  const queryClient = useQueryClient();
  const { setAlert } = useAlertStore();

  // Fetch tenant config
  const {
    data: tenantConfig,
    isLoading,
    error,
  } = useQuery<TenantConfig>({
    queryKey: ["tenantConfig"],
    queryFn: UserServices.getTenantConfig,
    staleTime: 1000 * 60 * 5,
  });

  // Update recoverable config mutation
  const updateRecoverableMutation = useMutation({
    mutationFn: (config: Record<string, boolean>) =>
      UserServices.updateRecoverableConfig(
        tenantConfig?.tenantName || "",
        config
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenantConfig"] });
      queryClient.invalidateQueries({ queryKey: ["userSettings"] });
      setAlert("dataUpdatedSuccessfully");
    },
    onError: (error) => {
      console.error("Error updating recoverable config:", error);
      setAlert("errorUpdateTeam");
    },
  });

  // Update computer expiration mutation
  const updateExpirationMutation = useMutation({
    mutationFn: (expiration: number) =>
      UserServices.updateComputerExpiration(
        tenantConfig?.tenantName || "",
        expiration
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenantConfig"] });
      setAlert("dataUpdatedSuccessfully");
    },
    onError: (error) => {
      console.error("Error updating computer expiration:", error);
      setAlert("errorUpdateTeam");
    },
  });

  // Update company name mutation
  const updateNameMutation = useMutation({
    mutationFn: (name: string) =>
      UserServices.updateCompanyName(tenantConfig?.tenantName || "", name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenantConfig"] });
      setAlert("dataUpdatedSuccessfully");
    },
    onError: (error) => {
      console.error("Error updating company name:", error);
      setAlert("errorUpdateTeam");
    },
  });

  const updateConfig = (data: UpdateTenantConfig) => {
    const promises = [];

    if (data.name !== undefined) {
      promises.push(updateNameMutation.mutateAsync(data.name));
    }
    if (data.isRecoverableConfig) {
      promises.push(
        updateRecoverableMutation.mutateAsync(data.isRecoverableConfig)
      );
    }
    if (data.computerExpiration !== undefined) {
      promises.push(
        updateExpirationMutation.mutateAsync(data.computerExpiration)
      );
    }

    // Ejecutar todas las mutaciones si hay datos para actualizar
    if (promises.length > 0) {
      Promise.all(promises).catch(console.error);
    }
  };

  return {
    tenantConfig,
    isLoading,
    error,
    updateConfig,
    isUpdating:
      updateRecoverableMutation.isPending ||
      updateExpirationMutation.isPending ||
      updateNameMutation.isPending,
  };
};
