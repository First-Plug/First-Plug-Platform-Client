import { Memberservices } from "@/services";
import { TeamMember } from "@/types";

export const createMember = async (data: TeamMember): Promise<TeamMember> => {
  const response = await Memberservices.createMember(data);
  return response;
};
