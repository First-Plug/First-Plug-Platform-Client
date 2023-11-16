import { Instance, types } from "mobx-state-tree";

export const ShimpentModel = types.model({
  _id: types.string,
  name: types.string,
  date: types.Date,
  types: types.optional(types.string, ""),
  trackingNumber: types.optional(types.string, ""),
  trackingURL: types.optional(types.string, ""),
  orders: types.optional(types.array(types.string), []),
});
export type Shimpent = Instance<typeof ShimpentModel>;