import { TeamServices } from "@/services";
import { Team } from "@/types";

export const getAllTeams = async (): Promise<Team[]> => {
  const response = await TeamServices.getAllTeams();
  return response;
};
