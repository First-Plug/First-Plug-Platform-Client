import { TeamServices } from "@/services";
import { Team } from "@/types";

export const changeTeamForMember = async (
  memberId: string,
  teamId: string
): Promise<Team> => {
  const response = await TeamServices.changeTeamForMember(memberId, teamId);
  return response;
};
