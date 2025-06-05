import { TeamServices } from "@/services";
import { Team } from "@/types";

export const updateTeam = async (
  id: string,
  team: Partial<Team>
): Promise<Team> => {
  const response = await TeamServices.updateTeam(id, team);
  return response;
};
