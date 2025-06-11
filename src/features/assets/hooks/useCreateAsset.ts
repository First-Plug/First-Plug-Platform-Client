import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAsset } from "@/features/assets";

export const useCreateAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["members"] });
      // setAlert("createProduct");
    },
    onError: () => {
      //   setAlert("createAssetError");
    },
  });
};
