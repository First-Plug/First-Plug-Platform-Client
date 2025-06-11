import { ShipmentStatus } from "@/features/shipments";

export const StatusColors = {
  pending: "bg-lightGreen",
  info: "bg-lightBlue",
  warn: "bg-lightRed",
  success: "bg-lightPurple",
  error: "bg-red",
  disabled: "bg-disabled",
  preparing: "bg-lightYellow",
  unavailable: "bg-[#FFC6D3]",
  transit: "bg-[#FFD59E]",
  transitWarn: "bg-[#FF8A80]",
} as const;

export type StatusColor = keyof typeof StatusColors;

export const ShipmentStateColors: Record<ShipmentStatus, StatusColor> = {
  Available: "pending",
  Complete: "success",
  "Missing Data": "warn",
  Delivered: "success",
  Preparing: "preparing",
  Shipped: "info",
  Unavailable: "unavailable",
  "In Transit": "transit",
  "In Transit - Missing Data": "transitWarn",
} as const;
