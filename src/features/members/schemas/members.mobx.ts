"use client";

import { types } from "mobx-state-tree";

import { ProductModel } from "@/types";
import { TeamModel } from "@/features/teams/schemas/team.mobx";

export const MemberModel = types.model({
  _id: types.optional(types.string, ""),
  firstName: types.string,
  lastName: types.string,
  fullName: types.string,
  email: types.string,
  activeShipment: types.optional(types.boolean, false),
  hasOnTheWayShipment: types.optional(types.boolean, false),
  picture: types.optional(types.string, ""),
  position: types.optional(types.string, ""),
  personalEmail: types.maybeNull(types.string),
  phone: types.optional(types.string, ""),
  city: types.optional(types.string, ""),
  country: types.optional(types.string, ""),
  zipCode: types.optional(types.string, ""),
  address: types.optional(types.string, ""),
  apartment: types.optional(types.string, ""),
  additionalInfo: types.optional(types.string, ""),
  startDate: types.optional(types.string, ""),
  birthDate: types.maybeNull(types.string),
  teamId: types.optional(types.string, ""),
  products: types.optional(types.array(ProductModel), []),
  team: types.optional(types.union(types.string, TeamModel), "Not Assigned"),
  dni: types.optional(types.union(types.string, types.number), ""),
  isDeleted: types.optional(types.boolean, false),
});
