import { useSession } from "next-auth/react";
import { AuthServices } from "@/features/auth";
import { useQuery } from "@tanstack/react-query";

export function useFetchUser() {
  const {
    data: { user },
    update,
  } = useSession();

  const {
    data: updatedUser,
    isLoading: isUserLoading,
    isFetching: isUserFetching,
  } = useQuery({
    queryKey: ["user", user?._id],
    queryFn: async () => {
      if (!user?._id) return user;
      const newUser = await AuthServices.getUserInfro(user._id);
      await update({ user: { ...newUser, password: user.password } });
      return newUser;
    },
    enabled: !!user?._id,
  });

  return {
    user: updatedUser,
    isUserLoading,
    isUserFetching,
  };
}
