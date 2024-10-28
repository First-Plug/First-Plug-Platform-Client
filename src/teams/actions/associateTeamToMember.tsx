import { TeamServices } from "@/services";
import { Team } from "@/types";

export const associateTeamToMember = async (
  teamId: string,
  memberId: string
): Promise<Team> => {
  const response = await TeamServices.associateTeamToMember(teamId, memberId);
  return response;
};
