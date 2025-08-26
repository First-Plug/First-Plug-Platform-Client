import { useQuery } from "@tanstack/react-query";
import { TenantsServices } from "../services/tenants.services";

export const useFetchTenants = () => {
  return useQuery({
    queryKey: ["tenants"],
    queryFn: async () => {
      console.log("🔍 Fetching tenants from API...");
      try {
        const result = await TenantsServices.getAllTenants();
        console.log("✅ API Response received:", result);
        return result;
      } catch (error: any) {
        console.error("❌ API Error:", error);
        console.error("Error details:", {
          status: error?.response?.status,
          message: error?.message,
          url: error?.config?.url,
        });
        throw error; // Re-throw to let React Query handle it
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: 2,
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
