import { TeamServices } from "@/services";

export const bulkDeleteTeams = async (teamIds: string[]): Promise<void> => {
  await TeamServices.bulkDeleteTeams(teamIds);
};
