import { TeamServices } from "@/services";
import { Team } from "@/types";

export const addToTeam = async (
  teamid: string,
  memberId: string
): Promise<Team> => {
  const response = await TeamServices.addToTeam(teamid, memberId);
  return response;
};
