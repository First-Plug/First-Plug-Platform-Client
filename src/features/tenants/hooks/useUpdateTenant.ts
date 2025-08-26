import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TenantsServices } from "../services/tenants.services";
import type { UpdateTenantRequest, UpdateTenantOfficeRequest, Tenant } from "../interfaces/tenant.interface";
import { useAlertStore } from "@/shared";

export const useUpdateTenant = () => {
  const queryClient = useQueryClient();
  const { setAlert } = useAlertStore();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTenantRequest }) => 
      TenantsServices.updateTenant(id, data),
    onSuccess: (updatedTenant: Tenant) => {
      // Update the specific tenant in cache
      queryClient.setQueryData(["tenant", updatedTenant.id], updatedTenant);
      
      // Invalidate and refetch tenants list
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      queryClient.invalidateQueries({ queryKey: ["tenants", "stats"] });
      
      // Show success alert
      setAlert("dataUpdatedSuccessfully");
    },
    onError: (error) => {
      console.error("Error updating tenant:", error);
      setAlert("errorUpdateTeam");
    },
  });
};

export const useUpdateTenantOffice = () => {
  const queryClient = useQueryClient();
  const { setAlert } = useAlertStore();

  return useMutation({
    mutationFn: ({ tenantId, data }: { tenantId: string; data: UpdateTenantOfficeRequest }) => 
      TenantsServices.updateTenantOffice(tenantId, data),
    onSuccess: (updatedTenant: Tenant) => {
      // Update the specific tenant in cache
      queryClient.setQueryData(["tenant", updatedTenant.id], updatedTenant);
      
      // Invalidate and refetch tenants list
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      
      // Show success alert
      setAlert("dataUpdatedSuccessfully");
    },
    onError: (error) => {
      console.error("Error updating tenant office:", error);
      setAlert("errorUpdateTeam");
    },
  });
};

export const useToggleTenantStatus = () => {
  const queryClient = useQueryClient();
  const { setAlert } = useAlertStore();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => 
      TenantsServices.toggleTenantStatus(id, isActive),
    onSuccess: (updatedTenant: Tenant) => {
      // Update the specific tenant in cache
      queryClient.setQueryData(["tenant", updatedTenant.id], updatedTenant);
      
      // Invalidate and refetch tenants list
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      queryClient.invalidateQueries({ queryKey: ["tenants", "stats"] });
      
      // Show success alert
      setAlert("dataUpdatedSuccessfully");
    },
    onError: (error) => {
      console.error("Error toggling tenant status:", error);
      setAlert("errorUpdateTeam");
    },
  });
};

export const useDeleteTenant = () => {
  const queryClient = useQueryClient();
  const { setAlert } = useAlertStore();

  return useMutation({
    mutationFn: (id: string) => TenantsServices.deleteTenant(id),
    onSuccess: (_, deletedId) => {
      // Remove the tenant from cache
      queryClient.removeQueries({ queryKey: ["tenant", deletedId] });
      
      // Invalidate and refetch tenants list
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      queryClient.invalidateQueries({ queryKey: ["tenants", "stats"] });
      
      // Show success alert
      setAlert("dataUpdatedSuccessfully");
    },
    onError: (error) => {
      console.error("Error deleting tenant:", error);
      setAlert("errorUpdateTeam");
    },
  });
};
