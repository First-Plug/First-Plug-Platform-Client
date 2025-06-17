import { Memberservices } from "@/features/members";
import { Member } from "@/features/members";

export const updateMember = async (
  id: string,
  data: Partial<Member>
): Promise<Member> => {
  const response = await Memberservices.updateMember(id, data);
  return response;
};
