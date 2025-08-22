import { useQuery } from "@tanstack/react-query";
import { TenantsServices } from "../services/tenants.services";
import type { TenantUser } from "../interfaces/tenant.interface";

export const useFetchTenantUsers = (tenantId: string) => {
  return useQuery({
    queryKey: ["tenant", tenantId, "users"],
    queryFn: () => TenantsServices.getTenantUsers(tenantId),
    enabled: !!tenantId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: 2,
  });
};
