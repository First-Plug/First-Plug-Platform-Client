import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAsset } from "../actions";
import { useStore } from "@/models";

export const useCreateAsset = () => {
  const queryClient = useQueryClient();
  const {
    alerts: { setAlert },
  } = useStore();

  return useMutation({
    mutationFn: createAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["members"] });
      setAlert("createProduct");
    },
    onError: () => {
      //   setAlert("createAssetError");
    },
  });
};
