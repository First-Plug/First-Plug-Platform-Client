import { Instance, types } from "mobx-state-tree";

export const TeamModel = types.model({
  _id: types.identifier,
  name: types.string,
  color: types.string,
  __v: types.number,
});

export type Team = Instance<typeof TeamModel>;
