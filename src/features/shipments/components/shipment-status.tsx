import type { ShipmentStatus } from "@/features/shipments";
import { ShipmentStateColors, StatusColors } from "./status-colors";

interface ShipmentStatusProps {
  status: ShipmentStatus;
}

export function ShipmentStatusCard({ status }: ShipmentStatusProps) {
  const colorClass = `${StatusColors[ShipmentStateColors[status]]}`;

  return (
    <span className={`${colorClass} p-1 rounded-md text-sm`}>{status}</span>
  );
}
