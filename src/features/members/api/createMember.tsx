import { Memberservices } from "@/features/members";
import { Member } from "@/features/members";

export const createMember = async (data: Member): Promise<Member> => {
  const response = await Memberservices.createMember(data);
  return response;
};
