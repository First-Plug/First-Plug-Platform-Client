import { Memberservices } from "@/services";

export const deleteMemberAction = async (id: string): Promise<void> => {
  await Memberservices.deleteMember(id);
};
