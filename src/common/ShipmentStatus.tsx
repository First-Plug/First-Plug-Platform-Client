import type { ShipmentStatus } from "@/types";
import { ShipmentStateColors, StatusColors } from "./StatusColors";

interface ShipmentStatusProps {
  status: ShipmentStatus;
}

export function ShipmentStatusCard({ status }: ShipmentStatusProps) {
  const colorClass = `${StatusColors[ShipmentStateColors[status]]}`;

  return (
    <span className={`${colorClass} p-1 rounded-md text-sm`}>{status}</span>
  );
}
