import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/shared";
import type { Shipment } from "@/features/shipments";

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

interface ShipmentsTableProps {
  data: {
    oldData: Shipment;
    newData: Shipment;
  };
}

const getUpdatedFields = (oldData: Shipment, newData: Shipment) => {
  const changes: { field: string; oldValue: string; newValue: string }[] = [];

  const ignoredFields = [
    "updatedAt",
    "createdAt",
    "deletedAt",
    "__v",
    "type",
    "isDeleted",
    "products",
  ];

  const dateFields = ["order_date", "desirableDate"];

  for (const key of Object.keys({ ...oldData, ...newData })) {
    if (ignoredFields.includes(key)) continue;

    const oldValue = oldData[key as keyof Shipment];
    const newValue = newData[key as keyof Shipment];

    if (oldValue !== newValue) {
      if (key === "snapshots") {
        const oldSnapshots = oldValue as typeof oldData.snapshots;
        const newSnapshots = newValue as typeof newData.snapshots;

        if (oldSnapshots?.length !== newSnapshots?.length) {
          changes.push({
            field: "quantity_products",
            oldValue: String(oldSnapshots?.length || 0),
            newValue: String(newSnapshots?.length || 0),
          });
        }

        oldSnapshots?.forEach((oldSnapshot, index) => {
          const newSnapshot = newSnapshots?.[index];
          if (newSnapshot && oldSnapshot.status !== newSnapshot.status) {
            changes.push({
              field: `Product ${oldSnapshot.name} Status`,
              oldValue: oldSnapshot.status,
              newValue: newSnapshot.status,
            });
          }
        });
      } else if (key === "price") {
        const oldPrice = oldValue as typeof oldData.price;
        const newPrice = newValue as typeof newData.price;
        if (
          oldPrice?.amount !== newPrice?.amount ||
          oldPrice?.currencyCode !== newPrice?.currencyCode
        ) {
          changes.push({
            field: key,
            oldValue: `${oldPrice?.amount || 0} ${
              oldPrice?.currencyCode || ""
            }`,
            newValue: `${newPrice?.amount || 0} ${
              newPrice?.currencyCode || ""
            }`,
          });
        }
      } else if (key === "originDetails" || key === "destinationDetails") {
        const oldDetails = oldValue as typeof oldData.originDetails;
        const newDetails = newValue as typeof newData.originDetails;

        for (const detailKey of Object.keys({ ...oldDetails, ...newDetails })) {
          if (
            oldDetails?.[detailKey as keyof typeof oldDetails] !==
            newDetails?.[detailKey as keyof typeof newDetails]
          ) {
            const isDate = detailKey === "desirableDate";
            const fieldLabel =
              detailKey === "desirableDate"
                ? key === "originDetails"
                  ? "Pickup Date"
                  : "Delivery Date"
                : `${
                    key === "originDetails" ? "Origin" : "Destination"
                  } ${detailKey}`;

            changes.push({
              field: fieldLabel,
              oldValue: isDate
                ? formatDate(
                    String(oldDetails?.[detailKey as keyof typeof oldDetails])
                  )
                : String(
                    oldDetails?.[detailKey as keyof typeof oldDetails] || "-"
                  ),
              newValue: isDate
                ? formatDate(
                    String(newDetails?.[detailKey as keyof typeof newDetails])
                  )
                : String(
                    newDetails?.[detailKey as keyof typeof newDetails] || "-"
                  ),
            });
          }
        }
      } else {
        changes.push({
          field: key,
          oldValue: dateFields.includes(key)
            ? formatDate(String(oldValue))
            : String(oldValue || "-"),
          newValue: dateFields.includes(key)
            ? formatDate(String(newValue))
            : String(newValue || "-"),
        });
      }
    }
  }

  return changes;
};

const fieldTranslations: { [key: string]: string } = {
  _id: "ID",
  order_id: "Order ID",
  tenant: "Tenant",
  quantity_products: "Products Quantity",
  order_date: "Order Date",
  shipment_type: "Shipment Type",
  shipment_status: "Shipment Status",
  price: "Price",
  origin: "Origin",
  destination: "Destination",
  products: "Products",
  "Pickup Date": "Pickup Date",
  "Delivery Date": "Delivery Date",
};

const translateField = (field: string) => {
  return fieldTranslations[field] || field;
};

const UpdateShipmentsTable: React.FC<ShipmentsTableProps> = ({ data }) => {
  const updatedFields = getUpdatedFields(data.oldData, data.newData);

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-light-grey border-gray-200 rounded-md">
          <TableHead className="px-4 py-3 border-r font-semibold text-black text-start">
            Order ID
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
        {updatedFields.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="h-24 text-center">
              No changes found.
            </TableCell>
          </TableRow>
        ) : (
          updatedFields.map((change, index) => (
            <TableRow key={`${data.oldData.order_id}-${change.field}`}>
              <TableCell className="px-4 py-2 border-r text-xs">
                {data.oldData.order_id}
              </TableCell>
              <TableCell className="px-4 py-2 border-r text-xs">
                {translateField(change.field)}
              </TableCell>
              <TableCell className="px-4 py-2 border-r text-xs">
                {change.oldValue}
              </TableCell>
              <TableCell className="px-4 py-2 text-xs">
                {change.newValue}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default UpdateShipmentsTable;
