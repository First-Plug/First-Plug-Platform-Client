import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TenantsServices } from "../services/tenants.services";
import type {
  UpdateTenantRequest,
  UpdateTenantOfficeRequest,
  Tenant,
} from "../interfaces/tenant.interface";
import { useAlertStore } from "@/shared";
import { sortTenants } from "@/features/tenants/hooks/sortTenants";

export const useUpdateTenant = () => {
  const queryClient = useQueryClient();
  const { setAlert } = useAlertStore();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTenantRequest }) =>
      TenantsServices.updateTenant(id, data),
    onSuccess: (updatedTenant: Tenant) => {
      // 1) Actualizar el detalle cacheado
      queryClient.setQueryData(["tenant", updatedTenant.id], updatedTenant);

      // 2) Reflejar el cambio en la lista cacheada
      queryClient.setQueryData<Tenant[]>(["tenants"], (curr) => {
        if (!curr) return curr;
        const list = [...curr];
        const i = list.findIndex((t) => t.id === updatedTenant.id);
        if (i === -1) return curr; // por si no estaba en la página cargada
        list[i] = updatedTenant;
        return sortTenants(list);
      });

      // Invalidate and refetch tenants list
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      queryClient.invalidateQueries({ queryKey: ["tenants", "stats"] });

      // Show success alert
      setAlert("dataUpdatedSuccessfully");
    },
    onError: (error) => {
      console.error("Error updating tenant:", error);
      setAlert("errorUpdateTenant");
    },
  });
};

export const useUpdateTenantOffice = () => {
  const queryClient = useQueryClient();
  const { setAlert } = useAlertStore();

  return useMutation({
    mutationFn: ({
      tenantId,
      data,
    }: {
      tenantId: string;
      data: UpdateTenantOfficeRequest;
    }) => TenantsServices.updateTenantOffice(tenantId, data),
    onSuccess: (updatedTenant: Tenant) => {
      // Update the specific tenant in cache (multiple possible keys)
      queryClient.setQueryData(["tenant", updatedTenant.id], updatedTenant);
      queryClient.setQueryData(["selectedTenant"], updatedTenant);

      // Invalidate and refetch all tenant-related queries
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      queryClient.invalidateQueries({ queryKey: ["tenant"] });

      // Show success alert
      setAlert("dataUpdatedSuccessfully");
    },
    onError: (error) => {
      console.error("Error updating tenant office:", error);
      setAlert("errorUpdateTenant");
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
      setAlert("errorUpdateTenant");
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
      setAlert("errorUpdateTenant");
    },
  });
};
