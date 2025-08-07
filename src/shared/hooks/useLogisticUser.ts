import { useSession } from "next-auth/react";

export const useLogisticUser = () => {
  const { data: session } = useSession();
  const userEmail = session?.user?.email;

  const isLogisticUser = userEmail === "nahuelr.developer2@gmail.com";

  return {
    isLogisticUser,
    userEmail,
  };
};
