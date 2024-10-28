import { Memberservices } from "@/services";
import { TeamMember } from "@/types";

export const getAllMembers = async (): Promise<TeamMember[]> => {
  const response = await Memberservices.getAllMembers();
  return response;
};
