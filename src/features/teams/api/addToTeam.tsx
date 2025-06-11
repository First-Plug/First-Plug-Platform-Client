import { TeamServices } from "@/services";
import { type Team } from "@/features/teams";

export const addToTeam = async (
  teamid: string,
  memberId: string
): Promise<Team> => {
  const response = await TeamServices.addToTeam(teamid, memberId);
  return response;
};
