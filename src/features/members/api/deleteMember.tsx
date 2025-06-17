import { Memberservices } from "@/features/members";

export const deleteMemberAction = async (id: string): Promise<void> => {
  await Memberservices.deleteMember(id);
};
