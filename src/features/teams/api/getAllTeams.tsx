import { TeamServices } from "@/services";
import { type Team } from "@/features/teams";

export const getAllTeams = async (): Promise<Team[]> => {
  const response = await TeamServices.getAllTeams();
  return response;
};
