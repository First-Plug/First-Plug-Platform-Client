import { useQuery } from "@tanstack/react-query";
import { TenantsServices } from "../services/tenants.services";
import { sortTenants } from "@/features/tenants/hooks/sortTenants";

export const useFetchTenants = () => {
  return useQuery({
    queryKey: ["tenants"],
    queryFn: async () => {
      try {
        const result = await TenantsServices.getAllTenants();

        return result;
      } catch (error: any) {
        throw error;
      }
    },
    staleTime: 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: "always",
    refetchOnReconnect: true,
    retry: 2,
    select: (list) => sortTenants(list),
  });
};

export const useFetchTenantById = (id: string) => {
  return useQuery({
    queryKey: ["tenant", id],
    queryFn: () => TenantsServices.getTenantById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

export const useFetchTenantByTenantName = (tenantName: string) => {
  return useQuery({
    queryKey: ["tenant", "by-name", tenantName],
    queryFn: () => TenantsServices.getTenantByTenantName(tenantName),
    enabled: !!tenantName,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

export const useFetchTenantStats = () => {
  return useQuery({
    queryKey: ["tenants", "stats"],
    queryFn: TenantsServices.getTenantStats,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: 2,
  });
};
