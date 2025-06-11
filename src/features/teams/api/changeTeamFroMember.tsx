import { TeamServices } from "@/services";
import { type Team } from "@/features/teams";

export const changeTeamForMember = async (
  memberId: string,
  teamId: string
): Promise<Team> => {
  const response = await TeamServices.changeTeamForMember(memberId, teamId);
  return response;
};
