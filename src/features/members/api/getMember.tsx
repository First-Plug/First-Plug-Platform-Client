import { Memberservices } from "@/features/members";
import { Member } from "@/features/members";

export const getMember = async (id: string): Promise<Member> => {
  const response = await Memberservices.getOneMember(id);
  return response;
};
