import { TeamServices } from "@/services";
import { type Team } from "@/features/teams";

export const associateTeamToMember = async (
  teamId: string,
  memberId: string
): Promise<Team> => {
  const response = await TeamServices.associateTeamToMember(teamId, memberId);
  return response;
};
