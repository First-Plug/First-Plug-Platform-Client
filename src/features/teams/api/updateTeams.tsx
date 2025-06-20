import { TeamServices } from "@/features/teams";
import { type Team } from "@/features/teams";

export const updateTeam = async (
  id: string,
  team: Partial<Team>
): Promise<Team> => {
  const response = await TeamServices.updateTeam(id, team);
  return response;
};
