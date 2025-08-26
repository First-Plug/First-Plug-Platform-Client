import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AssignedUsersServices } from "../services/assignedUsers.services";
import type { UpdateAssignedUserRequest } from "../interfaces/assignedUser.interface";

export const useUpdateAssignedUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      userId, 
      data 
    }: { 
      userId: string; 
      data: UpdateAssignedUserRequest 
    }) => {
      console.log("🔄 Updating assigned user:", userId, data);
      return AssignedUsersServices.updateAssignedUser(userId, data);
    },
    onSuccess: (updatedUser) => {
      console.log("✅ User updated successfully:", updatedUser);
      
      // Invalidate and refetch assigned users
      queryClient.invalidateQueries({ queryKey: ["assigned-users"] });
      
      // Optionally update the specific user in cache
      queryClient.setQueryData(["assigned-users"], (oldData: any) => {
        if (!oldData) return oldData;
        
        return oldData.map((user: any) => 
          user._id === updatedUser._id ? updatedUser : user
        );
      });
    },
    onError: (error: any) => {
      console.error("❌ Error updating user:", error);
      console.error("Error details:", {
        status: error?.response?.status,
        message: error?.message,
        data: error?.response?.data,
      });
    },
  });
};
