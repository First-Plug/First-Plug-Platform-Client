import { Memberservices } from "@/features/members";
import { Member } from "@/features/members";

export const getAllMembers = async (): Promise<Member[]> => {
  const response = await Memberservices.getAllMembers();
  return response;
};
