import { type Team, TeamServices } from "@/features/teams";

export const associateTeamToMember = async (
  teamId: string,
  memberId: string
): Promise<Team> => {
  const response = await TeamServices.associateTeamToMember(teamId, memberId);
  return response;
};
