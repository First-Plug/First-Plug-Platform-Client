import { TeamServices } from "@/features/teams";

export const bulkDeleteTeams = async (teamIds: string[]): Promise<void> => {
  await TeamServices.bulkDeleteTeams(teamIds);
};
