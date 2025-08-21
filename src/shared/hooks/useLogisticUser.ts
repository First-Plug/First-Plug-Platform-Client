import { useSession } from "next-auth/react";

export const useLogisticUser = () => {
  const { data: session } = useSession();
  const userEmail = session?.user?.email;

  const isLogisticUser = userEmail === "hola@firstplug.com";

  return {
    isLogisticUser,
    userEmail,
  };
};
