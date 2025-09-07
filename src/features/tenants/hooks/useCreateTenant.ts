import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TenantsServices } from "../services/tenants.services";
import type {
  CreateTenantRequest,
  Tenant,
} from "../interfaces/tenant.interface";
import { useAlertStore } from "@/shared";
import { sortTenants } from "@/features/tenants/hooks/sortTenants";

export const useCreateTenant = () => {
  const queryClient = useQueryClient();
  const { setAlert } = useAlertStore();

  return useMutation({
    mutationFn: (data: CreateTenantRequest) =>
      TenantsServices.createTenant(data),
    onSuccess: (newTenant: Tenant) => {
      // 1) Actualizar la lista de tenants
      queryClient.setQueryData<Tenant[]>(["tenants"], (curr) => {
        const list = curr ? [...curr] : [];
        const i = list.findIndex((t) => t.id === newTenant.id);
        if (i === -1) list.push(newTenant);
        else list[i] = newTenant;
        return sortTenants(list);
      });

      // 2) Cachear el detalle también (por si hay pantallas que lo consumen)
      queryClient.setQueryData(["tenant", newTenant.id], newTenant);

      // 3) Revalidar en background (mantiene datos frescos sin “flicker”)
      // Invalidate and refetch tenants list
      queryClient.invalidateQueries({
        queryKey: ["tenants"],
        refetchType: "inactive",
      });
      queryClient.invalidateQueries({ queryKey: ["tenants", "stats"] });

      // Optionally set the new tenant in cache
      queryClient.setQueryData(["tenant", newTenant.id], newTenant);

      // Show success alert
      setAlert("createTenantSuccess");
    },
    onError: (error) => {
      console.error("Error creating tenant:", error);
      setAlert("errorCreateTenant");
    },
  });
};
