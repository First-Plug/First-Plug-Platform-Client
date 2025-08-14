import { useMutation } from "@tanstack/react-query";
import { SecurityServices } from "../services/security.services";
import { ChangePasswordRequest } from "../types/settings.types";
import { useAlertStore } from "@/shared";

export const useSecuritySettings = (onSuccess?: () => void) => {
  const { setAlert } = useAlertStore();

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: (data: ChangePasswordRequest) =>
      SecurityServices.changePassword(data),
    onSuccess: () => {
      setAlert("passwordChange");
      // Call the onSuccess callback if provided (for form reset)
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: any) => {
      console.error("Error changing password:", error);
      setAlert("ErorPasswordChange");
    },
  });

  const changePassword = (data: ChangePasswordRequest) => {
    changePasswordMutation.mutate(data);
  };

  return {
    changePassword,
    isChanging: changePasswordMutation.isPending,
  };
};
