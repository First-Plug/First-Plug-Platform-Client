import { Memberservices } from "@/services";

export const deleteMember = async (id: string): Promise<void> => {
  await Memberservices.deleteMember(id);
};
