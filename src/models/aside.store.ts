import { AsideType, ASIDE_TYPES } from "@/types";
import { types } from "mobx-state-tree";

type Maybe<T> = T | undefined;

export const AsideStore = types
  .model({
    type: types.maybe(types.enumeration(ASIDE_TYPES)),
    csvContext: types.maybe(types.string),
    isClosed: types.optional(types.boolean, true),
  })
  .actions((store) => ({
    setAside(type: Maybe<AsideType>, csvContext?: string) {
      store.type = type;
      store.csvContext = csvContext;
      store.isClosed = false;
    },
    closeAside() {
      console.log("closeAside called, setting isClosed to true");
      store.type = undefined;
      store.isClosed = true;
    },
  }));
