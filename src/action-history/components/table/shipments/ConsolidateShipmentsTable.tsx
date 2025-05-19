import { Changes } from "@/action-history/interfaces";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

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
      comparisons.push({
        originalOrderId: originalShipment.order_id,
        consolidatedId: consolidatedShipment.order_id,
        field: "Pickup Date",
        oldValue: formatDate(
          originalShipment.originDetails?.desirableDate || ""
        ),
        newValue: formatDate(
          consolidatedShipment.originDetails?.desirableDate || ""
        ),
      });

      comparisons.push({
        originalOrderId: originalShipment.order_id,
        consolidatedId: consolidatedShipment.order_id,
        field: "Delivery Date",
        oldValue: formatDate(
          originalShipment.destinationDetails?.desirableDate || ""
        ),
        newValue: formatDate(
          consolidatedShipment.destinationDetails?.desirableDate || ""
        ),
      });
    }

    return comparisons;
  };

  const dateComparisons = getDateComparisons();

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-gray-200 bg-light-grey rounded-md">
          <TableHead className="py-3 px-4 border-r text-start text-black font-semibold">
            Original Order ID
          </TableHead>
          <TableHead className="py-3 px-4 border-r text-start text-black font-semibold">
            Consolidated ID
          </TableHead>
          <TableHead className="py-3 px-4 border-r text-start text-black font-semibold">
            Updated Field
          </TableHead>
          <TableHead className="py-3 px-4 border-r text-start text-black font-semibold">
            Old Data
          </TableHead>
          <TableHead className="py-3 px-4 text-start text-black font-semibold">
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
              <TableCell className="text-xs py-2 px-4 border-r">
                {comparison.originalOrderId}
              </TableCell>
              <TableCell className="text-xs py-2 px-4 border-r">
                {comparison.consolidatedId}
              </TableCell>
              <TableCell className="text-xs py-2 px-4 border-r">
                {comparison.field}
              </TableCell>
              <TableCell className="text-xs py-2 px-4 border-r">
                {comparison.oldValue}
              </TableCell>
              <TableCell className="text-xs py-2 px-4">
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
