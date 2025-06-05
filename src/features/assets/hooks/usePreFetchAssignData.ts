import { useQueryClient } from "@tanstack/react-query";
import { getAllMembers } from "@/features/members";
import { getAssetById } from "@/features/assets";
import { useStore } from "@/models";
import { Product } from "@/types";
import { Member } from "@/features/members";

export const usePrefetchAssignData = (productId: string) => {
  const queryClient = useQueryClient();
  const {
    products: { setProductToAssing },
    members: { setMembers },
  } = useStore();

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
      setProductToAssing(product);

      const cachedMembers = queryClient.getQueryData<Member[]>(["members"]);
      if (!cachedMembers) {
        const members: Member[] = await queryClient.fetchQuery<Member[]>({
          queryKey: ["members"],
          queryFn: getAllMembers,
        });
        setMembers(members);
      } else {
        setMembers(cachedMembers);
      }
    } catch (error) {
      console.error("Error prefetching assign data:", error);
    }
  };

  return { prefetchAssignData };
};
