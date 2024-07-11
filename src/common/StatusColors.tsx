import { OrderStatus, ShipmentStatus } from "@/types";

export const StatusColors = {
  pending: "bg-lightGreen",
  info: "bg-lightBlue",
  warn: "bg-lightRed",
  success: "bg-lightPurple",
  error: "bg-red",
  disabled: "bg-disabled",
  preparing: "bg-lightYellow",
} as const;

export type StatusColor = keyof typeof StatusColors;

export const OrderStateColors: Record<OrderStatus, StatusColor> = {
  ConfirmationPending: "pending",
  PaymentPending: "warn",
  Canceled: "warn",
  Confirmed: "success",
} as const;

export const ShipmentStateColors: Record<ShipmentStatus, StatusColor> = {
  Available: "pending",
  Complete: "success",
  "Missing Data": "warn",
  Delivered: "success",
  Preparing: "preparing",
  Shipped: "info",
} as const;

export const JobPositionColors: string[] = [
  "bg-pink-400",
  "bg-green",
  "bg-purple",
  "bg-yellow-200",
  "bg-red-200",
];

export type JobPosition = keyof typeof JobPositionColors;
