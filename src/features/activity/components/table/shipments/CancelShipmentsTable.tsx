import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/shared";
import type { Shipment } from "@/features/shipments";
import { formatDate } from "@/shared";

interface ShipmentsTableProps {
  data: Shipment | Shipment[];
}

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
                {shipment.origin}
                {" / "}
                {shipment.originDetails.desirableDate === "ASAP"
                  ? "ASAP"
                  : formatDate(shipment.originDetails.desirableDate)}
              </TableCell>
              <TableCell className="px-4 py-2 text-xs">
                {shipment.destination}
                {" / "}
                {shipment.destinationDetails.desirableDate === "ASAP"
                  ? "ASAP"
                  : formatDate(shipment.destinationDetails.desirableDate)}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default CancelShipmentsTable;
