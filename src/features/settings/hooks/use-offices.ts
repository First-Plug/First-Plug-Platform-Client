import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { OfficeServices } from "../services/office.services";
import { Office, UpdateOffice, CreateOffice } from "../types/settings.types";
import { useAlertStore } from "@/shared";
import { AxiosError } from "axios";
import {
  useOfficeStore,
  useOfficeCreationContext,
} from "../store/office.store";

export const useOffices = (): {
  offices: Office[];
  isLoading: boolean;
  error: any;
  createOffice: (data: CreateOffice) => void;
  updateOffice: (id: string, data: UpdateOffice) => Promise<Office>;
  deleteOffice: (id: string) => void;
  setDefaultOffice: (id: string) => void;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isSettingDefault: boolean;
} => {
  const queryClient = useQueryClient();
  const { setAlert } = useAlertStore();
  const { setNewlyCreatedOffice } = useOfficeStore();
  const { productIndex } = useOfficeCreationContext();

  const {
    data: offices = [],
    isLoading,
    error,
  } = useQuery<Office[]>({
    queryKey: ["offices"],
    queryFn: () => OfficeServices.getOffices(),
    staleTime: 1000 * 60 * 5,
  });
  const createOfficeMutation = useMutation({
    mutationFn: (data: CreateOffice) => OfficeServices.createOffice(data),
    onSuccess: (newOffice) => {
      queryClient.invalidateQueries({ queryKey: ["offices"] });
      setAlert("officeCreatedSuccessfully");
      // Notificar que se creó una nueva oficina con el contexto del producto
      setNewlyCreatedOffice(newOffice, productIndex ?? undefined);
    },
    onError: (error: AxiosError<{ message: string | string[] }>) => {
      console.error("Error creating office:", error);

      const errorMessage = error.response?.data?.message;
      const errorString = Array.isArray(errorMessage)
        ? errorMessage.join(", ")
        : errorMessage || "";

      if (
        errorString.toLowerCase().includes("nombre") ||
        errorString.toLowerCase().includes("name")
      ) {
        setAlert("errorOfficeDuplicateName");
      } else if (
        errorString.toLowerCase().includes("phone") ||
        errorString.toLowerCase().includes("teléfono")
      ) {
        setAlert("dynamicWarning", {
          title: "Invalid Phone Number",
          description:
            "The phone number format is invalid. Please use only numbers, spaces, and an optional + at the start (e.g., +543514567890).",
        });
      } else if (errorString.toLowerCase().includes("email")) {
        setAlert("dynamicWarning", {
          title: "Invalid Email",
          description:
            "The email format is invalid. Please enter a valid email address.",
        });
      } else {
        setAlert("errorCreateOffice");
      }
    },
  });

  const updateOfficeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOffice }) =>
      OfficeServices.updateOffice(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["offices"] });

      const previousOffices = queryClient.getQueryData<Office[]>(["offices"]);

      queryClient.setQueryData<Office[]>(["offices"], (old) => {
        if (!old) return old;
        return old.map((office) =>
          office._id === id ? { ...office, ...data } : office
        );
      });

      return { previousOffices };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offices"] });
      queryClient.invalidateQueries({ 
        queryKey: ["shipments"],
        refetchType: "active" // Force refetch even if stale
      });
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      setAlert("officeUpdatedSuccessfully");
    },
    onError: (
      error: AxiosError<{ message: string | string[] }>,
      _variables,
      context
    ) => {
      if (context?.previousOffices) {
        queryClient.setQueryData(["offices"], context.previousOffices);
      }

      const errorMessage = error.response?.data?.message;
      const errorString = Array.isArray(errorMessage)
        ? errorMessage.join(", ")
        : errorMessage || "";

      if (
        errorString.toLowerCase().includes("nombre") ||
        errorString.toLowerCase().includes("name")
      ) {
        setAlert("errorOfficeDuplicateName");
      } else if (
        errorString.toLowerCase().includes("phone") ||
        errorString.toLowerCase().includes("teléfono")
      ) {
        setAlert("dynamicWarning", {
          title: "Invalid Phone Number",
          description:
            "The phone number format is invalid. Please use only numbers, spaces, and an optional + at the start (e.g., +543514567890).",
        });
      } else if (errorString.toLowerCase().includes("email")) {
        setAlert("dynamicWarning", {
          title: "Invalid Email",
          description:
            "The email format is invalid. Please enter a valid email address.",
        });
      } else {
        setAlert("errorUpdateOffice");
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["offices"] });
    },
  });

  const deleteOfficeMutation = useMutation({
    mutationFn: (id: string) => OfficeServices.deleteOffice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offices"] });
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      setAlert("officeDeletedSuccessfully");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      console.error("Error deleting office:", error);

      const errorMessage = error.response?.data?.message || "";

      if (errorMessage.toLowerCase().includes("productos")) {
        setAlert("errorOfficeHasProducts");
      } else if (errorMessage.toLowerCase().includes("default")) {
        setAlert("errorOfficeIsDefault");
      } else {
        setAlert("errorDeleteOffice");
      }
    },
  });

  const setDefaultOfficeMutation = useMutation({
    mutationFn: (id: string) => OfficeServices.setDefaultOffice(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["offices"] });

      const previousOffices = queryClient.getQueryData<Office[]>(["offices"]);

      queryClient.setQueryData<Office[]>(["offices"], (old) => {
        if (!old) return old;
        return old.map((office) => ({
          ...office,
          isDefault: office._id === id,
        }));
      });

      return { previousOffices };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offices"] });
      setAlert("defaultOfficeUpdatedSuccessfully");
    },
    onError: (error: AxiosError<{ message: string }>, _id, context) => {
      if (context?.previousOffices) {
        queryClient.setQueryData(["offices"], context.previousOffices);
      }
      setAlert("errorSetDefaultOffice");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["offices"] });
    },
  });

  const createOffice = (data: CreateOffice) => {
    createOfficeMutation.mutate(data);
  };

  const updateOffice = async (
    id: string,
    data: UpdateOffice
  ): Promise<Office> => {
    return updateOfficeMutation.mutateAsync({ id, data });
  };

  const deleteOffice = (id: string) => {
    deleteOfficeMutation.mutate(id);
  };

  const setDefaultOffice = (id: string) => {
    setDefaultOfficeMutation.mutate(id);
  };

  return {
    offices,
    isLoading,
    error,
    createOffice,
    updateOffice,
    deleteOffice,
    setDefaultOffice,
    isCreating: createOfficeMutation.isPending,
    isUpdating: updateOfficeMutation.isPending,
    isDeleting: deleteOfficeMutation.isPending,
    isSettingDefault: setDefaultOfficeMutation.isPending,
  };
};
