import { UserServices } from "@/services/user.services";
import { User } from "@/types";
import { QueryFunctionContext } from "@tanstack/react-query";

export const getUserSettings = async ({
  queryKey,
}: QueryFunctionContext<[string, string?]>): Promise<User> => {
  const tenantName = queryKey[1] as string;

  if (!tenantName) {
    throw new Error("Tenant name is required");
  }

  try {
    const response = await UserServices.getRecoverableConfig(tenantName);
    return response;
  } catch (error) {
    console.error("Error fetching user settings:", error);
    throw error;
  }
};
