import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { WarehousesServices } from "../services/warehouses.services";

export const useFetchWarehouses = () => {
  return useQuery({
    queryKey: ["warehouses"],
    queryFn: async () => {
      console.log("🔍 Fetching warehouses from API...");
      try {
        const result = await WarehousesServices.getWarehousesWithTenants();
        console.log("✅ Warehouses received:", result);
        return result;
      } catch (error: any) {
        console.error("❌ API Error:", error);
        console.error("Error details:", {
          status: error?.response?.status,
          message: error?.message,
          url: error?.config?.url,
        });
        throw error;
      }
    },
    staleTime: 0,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    refetchOnReconnect: true,
    placeholderData: keepPreviousData,
  });
};
