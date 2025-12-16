import { useQueryClient } from "@tanstack/react-query";
import { getAllMembers } from "@/features/members";
import { getAssetById } from "@/features/assets";

import { Product } from "@/features/assets";
import { Member } from "@/features/members";

export const usePrefetchAssignData = (productId: string) => {
  const queryClient = useQueryClient();

  const prefetchAssignData = async () => {
    try {
      const cachedProduct = queryClient.getQueryData<Product>([
        "assets",
        productId,
      ]);

      const product = cachedProduct
        ? cachedProduct
        : await queryClient.fetchQuery<Product>({
            queryKey: ["assets", productId],
            queryFn: () => getAssetById(productId),
          });

      if (!product) {
        throw new Error("Failed to fetch product");
      }

      const cachedMembers = queryClient.getQueryData<Member[]>(["members"]);
      if (!cachedMembers) {
        const members: Member[] = await queryClient.fetchQuery<Member[]>({
          queryKey: ["members"],
          queryFn: getAllMembers,
        });
        queryClient.setQueryData(["members"], members);
      } else {
        queryClient.setQueryData(["members"], cachedMembers);
      }
    } catch (error) {
      // Error silenciado en prefetch
    }
  };

  return { prefetchAssignData };
};
