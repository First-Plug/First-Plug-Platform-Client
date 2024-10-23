import { Memberservices } from "@/services";
import { TeamMember } from "@/types";

export const updateMember = async (
  id: string,
  data: Partial<TeamMember>
): Promise<TeamMember> => {
  const response = await Memberservices.updateMember(id, data);
  return response;
};
