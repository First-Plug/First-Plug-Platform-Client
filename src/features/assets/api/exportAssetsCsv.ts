import { ProductServices } from "@/services";

export const exportAssetsCsv = async (): Promise<void> => {
  await ProductServices.exportProductsCsv();
};
