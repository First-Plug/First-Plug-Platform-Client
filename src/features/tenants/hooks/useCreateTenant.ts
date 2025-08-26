import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TenantsServices } from "../services/tenants.services";
import type { CreateTenantRequest, Tenant } from "../interfaces/tenant.interface";
import { useAlertStore } from "@/shared";

export const useCreateTenant = () => {
  const queryClient = useQueryClient();
  const { setAlert } = useAlertStore();

  return useMutation({
    mutationFn: (data: CreateTenantRequest) => TenantsServices.createTenant(data),
    onSuccess: (newTenant: Tenant) => {
      // Invalidate and refetch tenants list
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      queryClient.invalidateQueries({ queryKey: ["tenants", "stats"] });
      
      // Optionally set the new tenant in cache
      queryClient.setQueryData(["tenant", newTenant.id], newTenant);
      
      // Show success alert
      setAlert("createTeam"); // Reusing existing success alert
    },
    onError: (error) => {
      console.error("Error creating tenant:", error);
      setAlert("errorCreateTeam"); // Reusing existing error alert
    },
  });
};
