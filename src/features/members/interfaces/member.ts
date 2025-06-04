import { Instance } from "mobx-state-tree";
import { z } from "zod";

import { zodCreateMemberModel, MemberModel } from "@/features/members";
import { Team } from "@/types";
import { Product } from "@/types";

export type Member = Instance<typeof MemberModel>;

export type CreateMemberZodModel = z.infer<typeof zodCreateMemberModel>;
export type CreationMember = Omit<
  Member,
  "_id" | "teams" | "products" | "fullName"
>;

export type MemberTable = {
  _id: string;
  fullName: string;
  startDate: string;
  birthDate: string;
  team: Team | string;
  position: string;
  products: Product[];
};
