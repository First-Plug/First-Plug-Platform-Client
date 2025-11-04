import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  countriesByCode,
} from "@/shared";
import type { Shipment, Details } from "@/features/shipments";
import { formatDate } from "@/shared";

interface ShipmentsTableProps {
  data: Shipment | Shipment[];
}

// Helper para formatear ubicación con país
const formatLocationWithCountry = (
  location: string,
  details?: Details
): string => {
  const countryCode = details?.country;
  const countryName = countryCode
    ? countriesByCode[countryCode] || countryCode
    : "";

  // Si es Our office, intentar mostrar el nombre específico de la oficina
  if (location === "Our office" && countryName) {
    return `${location} (${countryName})`;
  }

  // Si es FP warehouse, mostrar con país
  if (location === "FP warehouse" && countryName) {
    return `${location} (${countryName})`;
  }

  // Si es Employee (legacy), mostrar con país
  if (location === "Employee" && countryName) {
    return `${location} (${countryName})`;
  }

  // Para miembros asignados u otras ubicaciones con país
  if (countryName && location !== "Our office" && location !== "FP warehouse") {
    // Si ya tiene formato "Nombre (País)", no duplicar
    if (location.includes("(") && location.includes(")")) {
      return location;
    }
    return `${location} (${countryName})`;
  }

  return location || "N/A";
};

const CancelShipmentsTable: React.FC<ShipmentsTableProps> = ({ data }) => {
  const normalizedData: Shipment[] = Array.isArray(data) ? data : [data];

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-light-grey border-gray-200 rounded-md">
          <TableHead className="px-4 py-3 border-r font-semibold text-black text-start">
            Order ID
          </TableHead>

          <TableHead className="px-4 py-3 border-r font-semibold text-black text-start">
            Origin / Pickup date
          </TableHead>
          <TableHead className="px-4 py-3 font-semibold text-black text-start">
            Destination / Delivery date
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {normalizedData.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="h-24 text-center">
              No shipments found.
            </TableCell>
          </TableRow>
        ) : (
          normalizedData.map((shipment) => (
            <TableRow key={shipment.order_id}>
              <TableCell className="px-4 py-2 border-r text-xs">
                {shipment.order_id}
              </TableCell>
              <TableCell className="px-4 py-2 border-r text-xs">
                {formatLocationWithCountry(
                  shipment.origin,
                  shipment.originDetails
                )}
                {" / "}
                {shipment.originDetails?.desirableDate === "ASAP"
                  ? "ASAP"
                  : formatDate(shipment.originDetails?.desirableDate)}
              </TableCell>
              <TableCell className="px-4 py-2 text-xs">
                {formatLocationWithCountry(
                  shipment.destination,
                  shipment.destinationDetails
                )}
                {" / "}
                {shipment.destinationDetails?.desirableDate === "ASAP"
                  ? "ASAP"
                  : formatDate(shipment.destinationDetails?.desirableDate)}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default CancelShipmentsTable;
