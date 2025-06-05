import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import type { Shipment } from "@/shipments/interfaces/shipments-response.interface";
import { formatDate } from "@/utils/formateDate";

interface ShipmentsTableProps {
  data: Shipment | Shipment[];
}

const CreateShipmentsTable: React.FC<ShipmentsTableProps> = ({ data }) => {
  const normalizedData: Shipment[] = Array.isArray(data) ? data : [data];

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-gray-200 bg-light-grey rounded-md">
          <TableHead className="py-3 px-4 border-r text-start text-black font-semibold">
            Order ID
          </TableHead>
          <TableHead className="py-3 px-4 border-r text-start text-black font-semibold">
            Category
          </TableHead>
          <TableHead className="py-3 px-4 border-r text-start text-black font-semibold">
            Product
          </TableHead>
          <TableHead className="py-3 px-4 border-r text-start text-black font-semibold">
            Serial
          </TableHead>
          <TableHead className="py-3 px-4 border-r text-start text-black font-semibold">
            Origin / Pickup date
          </TableHead>
          <TableHead className="py-3 px-4 text-start text-black font-semibold">
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
          normalizedData.map((shipment) =>
            shipment.snapshots.map((snapshot) => (
              <TableRow key={`${shipment.order_id}-${snapshot.serialNumber}`}>
                <TableCell className="text-xs py-2 px-4 border-r">
                  {shipment.order_id || "N/A"}
                </TableCell>
                <TableCell className="text-xs py-2 px-4 border-r">
                  {snapshot.category || "N/A"}
                </TableCell>
                <TableCell className="text-xs py-2 px-4 border-r">
                  {[
                    snapshot.attributes?.find((attr) => attr.key === "brand")
                      ?.value,
                    snapshot.attributes?.find((attr) => attr.key === "model")
                      ?.value,
                    snapshot.name,
                  ]
                    .filter(Boolean)
                    .join(" ")}{" "}
                </TableCell>
                <TableCell className="text-xs py-2 px-4 border-r">
                  {snapshot.serialNumber || "N/A"}
                </TableCell>
                <TableCell className="text-xs py-2 px-4 border-r">
                  {shipment.origin || ""}
                  {" / "}
                  {formatDate(shipment.originDetails.desirableDate) || ""}
                </TableCell>
                <TableCell className="text-xs py-2 px-4">
                  {shipment.destination || ""}
                  {" / "}
                  {formatDate(shipment.destinationDetails.desirableDate) || ""}
                </TableCell>
              </TableRow>
            ))
          )
        )}
      </TableBody>
    </Table>
  );
};

export default CreateShipmentsTable;
