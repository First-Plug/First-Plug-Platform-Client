import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteMemberAction } from "../actions";
import { useStore } from "@/models";
import { Product, TeamMember } from "@/types";
import { Memberservices, ProductServices } from "@/services";

export const useDeleteMember = () => {
  const queryClient = useQueryClient();
  const {
    members: { setMembers, deleteMember },
    alerts: { setAlert },
  } = useStore();

  return useMutation({
    mutationFn: async (id: string) => {
      const member = await Memberservices.getOneMember(id);

      if (!member) {
        throw new Error("Member not found");
      }

      const nonRecoverableProducts = member.products.filter(
        (product: Product) => !product.recoverable
      );

      await deleteMemberAction(id);

      if (nonRecoverableProducts.length > 0) {
        const productIds = nonRecoverableProducts.map((product) => product._id);
        await ProductServices.softDeleteMany(productIds);

        await queryClient.cancelQueries({ queryKey: ["assets"] });
        queryClient.setQueryData<Product[]>(["products"], (oldProducts = []) =>
          oldProducts.filter((product) => !productIds.includes(product._id))
        );
      }

      return { member, nonRecoverableProducts };
    },

    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["members"] });

      const previousMembers = queryClient.getQueryData<TeamMember[]>([
        "members",
      ]);

      queryClient.setQueryData<TeamMember[]>(
        ["members"],
        (oldMembers) => oldMembers?.filter((member) => member._id !== id) || []
      );

      return { previousMembers };
    },

    onError: (error, id, context) => {
      console.error("Error deleting member:", error);
      if (context?.previousMembers) {
        queryClient.setQueryData(["members"], context.previousMembers);
      }
    },

    onSuccess: (data, id) => {
      setAlert("deleteMember");
      const updatedMembers = queryClient.getQueryData<TeamMember[]>([
        "members",
      ]);
      deleteMember(id);
      setMembers(updatedMembers || []);
    },
  });
};
