import { Changes } from "@/features/activity";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/shared";

const formatDate = (dateString: string) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "ASAP";

  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

interface ConsolidateShipmentsTableProps {
  data: Changes;
}

const ConsolidateShipmentsTable: React.FC<ConsolidateShipmentsTableProps> = ({
  data,
}) => {
  const originalShipments = Array.isArray(data.oldData)
    ? data.oldData
    : [data.oldData];

  const consolidatedShipment = data.newData;

  const getDateComparisons = () => {
    const comparisons: {
      originalOrderId: string;
      consolidatedId: string;
      field: string;
      oldValue: string;
      newValue: string;
    }[] = [];

    for (const originalShipment of originalShipments) {
      const pickupOldValue = formatDate(
        originalShipment.originDetails?.desirableDate || ""
      );
      const pickupNewValue = formatDate(
        consolidatedShipment.originDetails?.desirableDate || ""
      );

      if (pickupOldValue !== pickupNewValue) {
        comparisons.push({
          originalOrderId: originalShipment.order_id,
          consolidatedId: consolidatedShipment.order_id,
          field: "Pickup Date",
          oldValue: pickupOldValue,
          newValue: pickupNewValue,
        });
      }

      const deliveryOldValue = formatDate(
        originalShipment.destinationDetails?.desirableDate || ""
      );
      const deliveryNewValue = formatDate(
        consolidatedShipment.destinationDetails?.desirableDate || ""
      );

      if (deliveryOldValue !== deliveryNewValue) {
        comparisons.push({
          originalOrderId: originalShipment.order_id,
          consolidatedId: consolidatedShipment.order_id,
          field: "Delivery Date",
          oldValue: deliveryOldValue,
          newValue: deliveryNewValue,
        });
      }
    }

    return comparisons;
  };

  const dateComparisons = getDateComparisons();

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-light-grey border-gray-200 rounded-md">
          <TableHead className="px-4 py-3 border-r font-semibold text-black text-start">
            Original Order ID
          </TableHead>
          <TableHead className="px-4 py-3 border-r font-semibold text-black text-start">
            Consolidated ID
          </TableHead>
          <TableHead className="px-4 py-3 border-r font-semibold text-black text-start">
            Updated Field
          </TableHead>
          <TableHead className="px-4 py-3 border-r font-semibold text-black text-start">
            Old Data
          </TableHead>
          <TableHead className="px-4 py-3 font-semibold text-black text-start">
            New Data
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {dateComparisons.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="h-24 text-center">
              No changes found.
            </TableCell>
          </TableRow>
        ) : (
          dateComparisons.map((comparison, index) => (
            <TableRow
              key={`${comparison.originalOrderId}-${comparison.field}-${index}`}
            >
              <TableCell className="px-4 py-2 border-r text-xs">
                {data.context === "single-product"
                  ? "-"
                  : comparison.originalOrderId}
              </TableCell>
              <TableCell className="px-4 py-2 border-r text-xs">
                {comparison.consolidatedId}
              </TableCell>
              <TableCell className="px-4 py-2 border-r text-xs">
                {comparison.field}
              </TableCell>
              <TableCell className="px-4 py-2 border-r text-xs">
                {data.context === "single-product" ? "-" : comparison.oldValue}
              </TableCell>
              <TableCell className="px-4 py-2 text-xs">
                {comparison.newValue}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default ConsolidateShipmentsTable;
