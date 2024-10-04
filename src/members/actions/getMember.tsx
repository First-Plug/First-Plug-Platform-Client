import { Memberservices } from "@/services";
import { TeamMember } from "@/types";

export const getMember = async (id: string): Promise<TeamMember> => {
  const response = await Memberservices.getOneMember(id);
  return response;
};
