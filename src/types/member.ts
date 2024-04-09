import { Instance, types } from "mobx-state-tree";
import { ShipmentStatus } from "./shipment";
import { ProductModel } from "./product";

export const TeamMemberModel = types.model({
  _id: types.optional(types.string, ""),
  firstName: types.optional(types.string, ""),
  img: types.optional(types.string, ""),
  lastName: types.optional(types.string, ""),
  dateOfBirth: types.optional(types.string, ""),
  phone: types.optional(types.string, ""),
  email: types.optional(types.string, ""),
  jobPosition: types.optional(types.string, ""),
  city: types.optional(types.string, ""),
  zipCode: types.optional(types.string, ""),
  address: types.optional(types.string, ""),
  appartment: types.optional(types.string, ""),
  joiningDate: types.optional(types.string, ""),
  timeSlotForDelivery: types.optional(types.string, ""),
  additionalInfo: types.optional(types.string, ""),
  teams: types.optional(types.array(types.string), []),
  products: types.optional(types.array(ProductModel), []),
});

export type TeamMember = Instance<typeof TeamMemberModel>;

export type TeamMemberTable = {
  _id: string;
  fullName: string;
  joiningDate: string;
  dateOfBirth: string;
  teams: string[];
  jobPosition: string;
  shipmentDetails: ShipmentStatus;
};
export type CreationTeamMember = Omit<TeamMember, "_id" | "teams">;
