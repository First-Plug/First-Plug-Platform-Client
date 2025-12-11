import { useMutation } from "@tanstack/react-query";
import { exportAssetsCsv } from "@/features/assets";

export const useExportAssetsCsv = () => {
  return useMutation({
    mutationFn: () => exportAssetsCsv(),
  });
};
