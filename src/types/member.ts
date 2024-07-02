import { Instance, types } from "mobx-state-tree";
import { zodCreateProductModel, ProductModel, Product } from "./product";
import { z } from "zod";
import { TeamModel, Team } from "./teams";

export const TeamMemberModel = types.model({
  _id: types.optional(types.string, ""),
  firstName: types.string,
  lastName: types.string,
  fullName: types.string,
  email: types.string,
  picture: types.optional(types.string, ""),
  position: types.optional(types.string, ""),
  personalEmail: types.optional(types.string, ""),
  phone: types.optional(types.string, ""),
  city: types.optional(types.string, ""),
  country: types.optional(types.string, ""),
  zipCode: types.optional(types.string, ""),
  address: types.optional(types.string, ""),
  apartment: types.optional(types.string, ""),
  additionalInfo: types.optional(types.string, ""),
  startDate: types.optional(types.string, ""),
  birthDate: types.optional(types.string, ""),
  products: types.optional(types.array(ProductModel), []),
  team: types.optional(
    types.union(types.string, types.reference(TeamModel)),
    "Not Assigned"
  ),
  isDeleted: types.optional(types.boolean, false),
});

export type TeamMember = Instance<typeof TeamMemberModel>;

export type TeamMemberTable = {
  _id: string;
  fullName: string;
  startDate: string;
  birthDate: string;
  team: Team | string;
  position: string;
  products: Product[];
};

const nameRegex = /^[A-Za-z\s]+$/;
const phoneRegex = /^\+?[0-9\s]*$/;

const isAdult = (date: string) => {
  const birthDate = new Date(date);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    return age - 1 >= 18;
  }
  return age >= 18;
};

export const zodCreateMembertModel = z.object({
  firstName: z
    .string()
    .min(1, { message: "First name is required" })
    .regex(nameRegex, { message: "First name must only contain letters" })
    .trim(),
  lastName: z
    .string()
    .min(1, { message: "Last name is required" })
    .regex(nameRegex, { message: "Last name must only contain letters" })
    .trim(),
  email: z
    .string()
    .email({ message: "Invalid email address" })
    .trim()
    .toLowerCase()
    .min(1, { message: "Email is required" }),
  picture: z.string().optional(),
  position: z.string().trim().optional(),
  personalEmail: z.string().optional(),
  // personalEmail: z.string().email().trim().toLowerCase().optional(),
  phone: z
    .string()
    .trim()
    .regex(phoneRegex, {
      message: "Phone number must only contain numbers and the '+' sign",
    })
    .optional(),
  city: z.string().trim().optional(),
  country: z.string().trim().optional(),
  zipCode: z.string().trim().optional(),
  address: z.string().trim().optional(),
  apartment: z.string().trim().optional(),
  additionalInfo: z.string().trim().optional(),
  startDate: z.string().trim().optional(),
  birthDate: z.string().trim().optional(),
  products: z.array(zodCreateProductModel).optional(),
  team: z.string().trim().optional(),
});

export type CreateMemberZodModel = z.infer<typeof zodCreateMembertModel>;
export type CreationTeamMember = Omit<
  TeamMember,
  "_id" | "teams" | "products" | "fullName"
>;
