import { Instance, types } from "mobx-state-tree";
import { ProductModel } from "./product";
import { TeamMemberModel } from "./member";

export const ORDER_STATUSES = [
  "OrderConfirmed",
  "OrderCanceled",
  "ConfirmationPending",
  "PaymentPending",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const OrderModel = types.model({
  _id: types.string,
  teamMember: types.optional(types.array(TeamMemberModel), []),
  status: types.enumeration(ORDER_STATUSES),
  date: types.string,
  products: types.optional(types.array(ProductModel), []),
});
export type Order = Instance<typeof OrderModel>;
