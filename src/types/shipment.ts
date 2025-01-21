import { ISimpleType, Instance, types } from "mobx-state-tree";
import { Product, ProductModel } from "./product";

export const SHIPMENT_STATUS = [
  "Missing Data",
  "Delivered",
  "Preparing",
  "Available",
  "Shipped",
  "Complete",
  "Unavailable",
] as const;

export type ShipmentStatus = (typeof SHIPMENT_STATUS)[number];

export const SHIPMENT_TYPE = ["Courrier", "Internal"] as const;

export type ShipmentType = (typeof SHIPMENT_TYPE)[number];

const ISOStringType: ISimpleType<string> = types.custom<string, string>({
  name: "ISOString",
  fromSnapshot(value: string) {
    return value;
  },
  toSnapshot(value: string) {
    return value;
  },
  isTargetType(value: string) {
    return typeof value === "string";
  },
  getValidationMessage(value: string) {
    const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
    if (!regex.test(value)) {
      return "Invalid ISO String format";
    }
    return "";
  },
});

export const ShimpentModel = types.model({
  _id: types.string,
  memberId: types.string,
  name: types.string,
  lastName: types.string,
  date: ISOStringType,
  status: types.enumeration(SHIPMENT_STATUS),
  type: types.enumeration(SHIPMENT_TYPE),
  trackingNumber: types.optional(types.string, ""),
  trackingURL: types.optional(types.string, ""),
  products: types.optional(types.array(ProductModel), []),
});
export const SHIPMENT_BY_MONTH_STATUS = [
  "Open",
  "Closed",
  "PaymentPending",
] as const;

export type ShipmentByMonthStatus = (typeof SHIPMENT_BY_MONTH_STATUS)[number];
export type Shipment = Instance<typeof ShimpentModel>;
export type ShipmentCreation = Omit<Shipment, "_id" | "__v">;

export type ShipmentByMonth = {
  month: string;
  status: ShipmentByMonthStatus;
  price: number;
  shipments: Shipment[];
};

export type ShipmentByMonthTable = {
  month: string;
  status: string;
  price: number;
  shipments: number;
};
export type IShipmentTable = {
  orderId: string;
  date: string;
  productsQuantity: number;
  price: number;
  type: string;
  trackingURL: string;
  products: Product[];
};
