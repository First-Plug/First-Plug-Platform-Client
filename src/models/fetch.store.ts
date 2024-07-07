import { types } from "mobx-state-tree";

export const FetchStore = types
  .model({
    isFetching: types.boolean,
  })
  .actions((store) => ({
    setFetching(status: boolean) {
      store.isFetching = status;
    },
  }));
