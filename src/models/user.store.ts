import { types } from "mobx-state-tree";
import { LoggedInUser, LoggedInUserModel } from "@/types";

export const UserStore = types
  .model({
    user: types.maybe(LoggedInUserModel),
  })
  .actions((store) => ({
    setUser(user: LoggedInUser) {
      store.user = user;
    },
    setUserRecoverable(user: LoggedInUser) {
      if (store.user) {
        if (user.isRecoverableConfig) {
          store.user.isRecoverableConfig.replace(user.isRecoverableConfig);
        }
      }
    },
  }));
