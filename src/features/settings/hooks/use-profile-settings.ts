import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProfileServices } from "../services/profile.services";
import { UserProfile, UpdateUserProfile } from "../types/settings.types";
import { useAlertStore } from "@/shared";

export const useProfileSettings = () => {
  const queryClient = useQueryClient();
  const { setAlert } = useAlertStore();

  // Fetch user profile
  const {
    data: profile,
    isLoading,
    error,
  } = useQuery<UserProfile>({
    queryKey: ["userProfile"],
    queryFn: ProfileServices.getUserProfile,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Update user profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateUserProfile) =>
      ProfileServices.updateUserProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      setAlert("dataUpdatedSuccessfully");
    },
    onError: (error) => {
      console.error("Error updating profile:", error);
      setAlert("errorUpdateProfile");
    },
  });

  const updateProfile = (data: UpdateUserProfile) => {
    updateProfileMutation.mutate(data);
  };

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    isUpdating: updateProfileMutation.isPending,
  };
};
