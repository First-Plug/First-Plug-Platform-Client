import { AsideType, ASIDE_TYPES } from "@/types";
import { types } from "mobx-state-tree";

type Maybe<T> = T | undefined;

export const AsideStore = types
  .model({
    type: types.maybe(types.enumeration(ASIDE_TYPES)),
    stack: types.optional(types.array(types.frozen()), []),
    csvContext: types.maybe(types.string),
    isClosed: types.optional(types.boolean, true),
    context: types.maybe(types.frozen()),
  })
  .actions((store) => ({
    setAside(type: Maybe<AsideType>, csvContext?: string, context?: any) {
      if (store.type) {
        store.stack.push({
          type: store.type,
          csvContext: store.csvContext,
          context: store.context,
        });
      }

      store.type = type;
      store.csvContext = csvContext;
      store.context = context;
      store.isClosed = false;
    },
    popAside(members: any) {
      const lastAside = store.stack.pop();
      if (lastAside) {
        store.type = lastAside.type;
        store.csvContext = lastAside.csvContext;
        store.context = lastAside.context;

        if (lastAside.context?.selectedMember) {
          const updatedMember = members.find(
            (member) => member._id === lastAside.context.selectedMember
          );
          if (updatedMember) {
            store.context.selectedMember = updatedMember;
          }
        }
        return lastAside;
      } else {
        this.closeAside();
        return null;
      }
    },
    clearStack() {
      store.stack.clear();
    },
    closeAside() {
      store.type = undefined;
      store.stack.clear();
      store.context = undefined;
      store.isClosed = true;
    },
  }));
