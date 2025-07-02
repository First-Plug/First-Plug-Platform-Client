import { ProductServices } from "@/features/assets";

export const exportAssetsCsv = async (): Promise<void> => {
  await ProductServices.exportProductsCsv();
};
