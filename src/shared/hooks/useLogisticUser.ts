import { useSession } from "next-auth/react";

export const useLogisticUser = () => {
  const { data: session } = useSession();
  const userEmail = session?.user?.email;
  const userRole = session?.user?.role;

  // Verificar por email hardcodeado O por role
  const adminEmails = ["hola@firstplug.com", "superadmin@mail.com"];
  const isLogisticUser =
    adminEmails.includes(userEmail) || userRole === "superadmin";

  return {
    isLogisticUser,
    userEmail,
    userRole,
  };
};
