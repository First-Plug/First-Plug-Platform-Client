import { RootStore, RootStoreContext } from "@/models";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export const StoreProvider = ({ children }: Props) => {
  const store = RootStore.create({
    orders: {},
    shipments: {},
    products: {},
    teams: {},
    members: {},
    aside: {},
    user: {},
    alerts: {},
  });

  return (
    <RootStoreContext.Provider value={store}>
      {children}
    </RootStoreContext.Provider>
  );
};
