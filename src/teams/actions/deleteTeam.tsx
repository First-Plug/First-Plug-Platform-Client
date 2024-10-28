import { TeamServices } from "@/services";

export const deleteTeam = async (id: string): Promise<void> => {
  const response = await TeamServices.deleteTeam(id);
};
