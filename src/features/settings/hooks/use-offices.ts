import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { OfficeServices } from "../services/office.services";
import { Office, UpdateOffice, CreateOffice } from "../types/settings.types";
import { useAlertStore } from "@/shared";
import { mockOffices } from "../data/mock-offices";

// ========================================
// MOCK DATA - TEMPORARY UNTIL API ENDPOINTS ARE READY
// ========================================
// Mock data storage - simple in-memory storage for demo purposes
// TODO: Replace with real API calls when endpoints are available
let mockOfficesData: Office[] = [...mockOffices];

export const useOffices = (): {
  offices: Office[];
  isLoading: boolean;
  error: any;
  createOffice: (data: CreateOffice) => void;
  updateOffice: (id: string, data: UpdateOffice) => void;
  deleteOffice: (id: string) => void;
  setDefaultOffice: (id: string) => void;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isSettingDefault: boolean;
} => {
  const queryClient = useQueryClient();
  const { setAlert } = useAlertStore();

  // Fetch all offices - Using mock data temporarily
  // TODO: Replace with OfficeServices.getOffices() when API endpoint is ready
  const {
    data: offices = [],
    isLoading,
    error,
  } = useQuery<Office[]>({
    queryKey: ["offices"],
    queryFn: async () => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      return mockOfficesData;
    },
    staleTime: 1000 * 60 * 5,
  });

  // Create office mutation - MOCK VERSION
  // TODO: Replace with OfficeServices.createOffice(data) when API endpoint is ready
  const createOfficeMutation = useMutation({
    mutationFn: async (data: CreateOffice) => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const newOffice: Office = {
        _id: Date.now().toString(), // Simple ID generation for mock
        ...data,
        isDefault: mockOfficesData.length === 0, // First office is default
      };
      mockOfficesData.push(newOffice);
      return newOffice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offices"] });
      setAlert("officeCreatedSuccessfully");
    },
    onError: (error) => {
      console.error("Error creating office:", error);
      setAlert("errorCreateOffice");
    },
  });

  // Update office mutation
  const updateOfficeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateOffice }) => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const officeIndex = mockOfficesData.findIndex(
        (office) => office._id === id
      );
      if (officeIndex !== -1) {
        mockOfficesData[officeIndex] = {
          ...mockOfficesData[officeIndex],
          ...data,
        };
      }
      return { _id: id, ...data } as Office;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offices"] });
      queryClient.invalidateQueries({ queryKey: ["shipments"] });
      setAlert("officeUpdatedSuccessfully");
    },
    onError: (error) => {
      console.error("Error updating office:", error);
      setAlert("errorUpdateOffice");
    },
  });

  // Delete office mutation
  const deleteOfficeMutation = useMutation({
    mutationFn: async (id: string) => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      mockOfficesData = mockOfficesData.filter((office) => office._id !== id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offices"] });
      setAlert("officeDeletedSuccessfully");
    },
    onError: (error) => {
      console.error("Error deleting office:", error);
      setAlert("errorDeleteOffice");
    },
  });

  // Set default office mutation
  const setDefaultOfficeMutation = useMutation({
    mutationFn: async (id: string) => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      mockOfficesData = mockOfficesData.map((office) => ({
        ...office,
        isDefault: office._id === id,
      }));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offices"] });
      setAlert("defaultOfficeUpdatedSuccessfully");
    },
    onError: (error) => {
      console.error("Error setting default office:", error);
      setAlert("errorSetDefaultOffice");
    },
  });

  const createOffice = (data: CreateOffice) => {
    createOfficeMutation.mutate(data);
  };

  const updateOffice = (id: string, data: UpdateOffice) => {
    updateOfficeMutation.mutate({ id, data });
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
