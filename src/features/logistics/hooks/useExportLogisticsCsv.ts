import { useMutation } from "@tanstack/react-query";
import { LogisticsServices } from "../services/logistics.services";

export const useExportLogisticsCsv = () => {
  return useMutation({
    mutationFn: () => LogisticsServices.exportLogisticsCsv(),
    onError: (error) => {
      console.error("Failed to export logistics CSV:", error);
    },
    onSuccess: () => {
      console.log("Logistics exported successfully!");
    },
  });
};
