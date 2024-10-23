import { useMutation } from "@tanstack/react-query";
import { exportAssetsCsv } from "../actions";

export const useExportAssetsCsv = () => {
  return useMutation({
    mutationFn: () => exportAssetsCsv(),
    onError: (error) => {
      console.error("Failed to export assets CSV:", error);
    },
    onSuccess: () => {
      console.log("Assets exported successfully!");
    },
  });
};