import { useQueryClient } from "@tanstack/react-query";
import { getAllMembers } from "@/members/actions";
import { getAssetById } from "../actions";
import { useStore } from "@/models";
import { Product, TeamMember } from "@/types";

export const usePrefetchAssignData = (productId: string) => {
  const queryClient = useQueryClient();
  const {
    products: { setProductToAssing },
    members: { setMembers },
  } = useStore();

  const prefetchAssignData = async () => {
    try {
      console.log("Prefetching assign data...");

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

      console.log("Product prefetched", product);
      setProductToAssing(product);

      // Prefetch the members if not already cached
      const cachedMembers = queryClient.getQueryData<TeamMember[]>(["members"]);
      if (!cachedMembers) {
        const members: TeamMember[] = await queryClient.fetchQuery<
          TeamMember[]
        >({
          queryKey: ["members"],
          queryFn: getAllMembers,
        });
        console.log("Members prefetched", members);
        setMembers(members);
      } else {
        console.log("Members found in cache", cachedMembers);
        setMembers(cachedMembers);
      }
    } catch (error) {
      console.error("Error prefetching assign data:", error);
    }
  };

  return { prefetchAssignData };
};
