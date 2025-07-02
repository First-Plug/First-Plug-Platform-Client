import { TeamServices } from "@/features/teams";

export const deleteTeam = async (id: string): Promise<void> => {
  const response = await TeamServices.deleteTeam(id);
};
