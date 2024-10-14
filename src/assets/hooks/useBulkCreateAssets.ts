import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bulkCreateAssets } from "../actions";
import { useStore } from "@/models";

export const useBulkCreateAssets = () => {
  const queryClient = useQueryClient();
  const {
    alerts: { setAlert },
  } = useStore();

  return useMutation({
    mutationFn: bulkCreateAssets,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      setAlert("bulkCreateProductSuccess");
    },
    onError: () => setAlert("bulkCreateProductError"),
  });
};
