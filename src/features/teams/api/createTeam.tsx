import { TeamServices } from "@/services";
import { type Team } from "@/features/teams";

type CreateTeamProps = {
  name: string;
  color?: string;
};

export const createTeams = async (data: CreateTeamProps): Promise<Team> => {
  const response = await TeamServices.createTeam(data);
  return response;
};
