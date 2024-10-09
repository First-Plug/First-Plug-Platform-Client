import { TeamServices } from "@/services";
import { Team } from "@/types";

export const removeFromTeam = async (
  teamId: string,
  memberId: string
): Promise<Team> => {
  const response = await TeamServices.removeFromTeam(teamId, memberId);
  return response;
};
