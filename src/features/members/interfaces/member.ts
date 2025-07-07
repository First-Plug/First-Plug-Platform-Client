import { z } from "zod";

import { zodCreateMemberModel } from "@/features/members";
import { Team } from "@/features/teams";
import { Product } from "@/features/assets";

export interface Member {
  _id?: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  activeShipment?: boolean;
  hasOnTheWayShipment?: boolean;
  picture?: string;
  position?: string;
  personalEmail?: string | null;
  phone?: string;
  city?: string;
  country?: string;
  zipCode?: string;
  address?: string;
  apartment?: string;
  additionalInfo?: string;
  startDate?: string;
  birthDate?: string | null;
  teamId?: string;
  products?: Product[];
  team?: Team;
  dni?: string | number;
  isDeleted?: boolean;
}

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
