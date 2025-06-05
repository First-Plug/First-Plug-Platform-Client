import { TeamServices } from "@/services";
import type { Team } from "@/types";

export const getAllTeams = async (): Promise<Team[]> => {
  const response = await TeamServices.getAllTeams();
  return response;
};
