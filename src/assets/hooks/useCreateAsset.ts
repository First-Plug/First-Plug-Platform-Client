import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAsset } from "../actions";
import { useStore } from "@/models";
import { Product } from "@/types";

export const useCreateAsset = () => {
  const queryClient = useQueryClient();
  const {
    alerts: { setAlert },
  } = useStore();

  return useMutation({
    mutationFn: createAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      setAlert("createProduct");
    },
    onError: () => {
      //   setAlert("createAssetError");
    },
  });
};
