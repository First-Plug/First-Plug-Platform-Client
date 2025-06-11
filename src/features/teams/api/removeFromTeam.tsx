import { TeamServices } from "@/services";
import { type Team } from "@/features/teams";

export const removeFromTeam = async (
  teamId: string,
  memberId: string
): Promise<Team> => {
  const response = await TeamServices.removeFromTeam(teamId, memberId);
  return response;
};
