import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Product } from "@/types";

interface AssetAttribute {
  key: string;
  value: string;
}

interface AssetsTableProps {
  data: {
    oldData: Product;
    newData: Product;
  };
}

const getUpdatedFields = (oldData: Product, newData: Product) => {
  const changes: { field: string; oldValue: any; newValue: any }[] = [];

  Object.keys({ ...oldData, ...newData }).forEach((key) => {
    if (
      [
        "updatedAt",
        "createdAt",
        "acquisitionDate",
        "deletedAt",
        "status",
      ].includes(key)
    ) {
      return;
    }

    if (key === "attributes") {
      const oldAttributes = oldData.attributes || [];
      const newAttributes = newData.attributes || [];

      newAttributes.forEach((newAttr) => {
        const oldAttr = oldAttributes.find((attr) => attr.key === newAttr.key);
        if (!oldAttr || oldAttr.value !== newAttr.value) {
          changes.push({
            field: `${newAttr.key}`,
            oldValue: oldAttr ? oldAttr.value : "-",
            newValue: newAttr.value,
          });
        }
      });
    } else if (key !== "products") {
      const oldExists = Object.prototype.hasOwnProperty.call(oldData, key);
      const newExists = Object.prototype.hasOwnProperty.call(newData, key);

      const oldValue = oldData[key as keyof Product] || "";
      const newValue = newData[key as keyof Product] || "";

      if (!oldExists && !newExists) return;
      if (oldValue === "" && !newExists) return;

      // Comparar precios correctamente si es un objeto con `amount` y `currencyCode`
      if (
        key === "price" &&
        typeof oldValue === "object" &&
        typeof newValue === "object"
      ) {
        if (
          oldValue.amount !== newValue.amount ||
          oldValue.currencyCode !== newValue.currencyCode
        ) {
          changes.push({
            field: key,
            oldValue: `${oldValue.amount} ${oldValue.currencyCode}`,
            newValue: `${newValue.amount} ${newValue.currencyCode}`,
          });
        }
      } else if (oldValue !== newValue) {
        changes.push({
          field: key,
          oldValue: oldValue || "-",
          newValue: newValue || "-",
        });
      }
    }
  });

  return changes;
};

const formatValue = (value: any, field?: string) => {
  if (field === "recoverable") {
    return value === true ? "Yes" : "No";
  }
  if (typeof value === "object" && value !== null) {
    return `${value.amount} ${value.currencyCode}`;
  }
  return value || "-";
};

const UpdateAssetsTable: React.FC<AssetsTableProps> = ({ data }) => {
  const updatedFields = getUpdatedFields(data.oldData, data.newData);

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-gray-200 bg-light-grey rounded-md">
          <TableHead className="py-3 px-4 border-r text-start text-black font-semibold">
            Category
          </TableHead>
          <TableHead className="py-3 px-4 border-r text-start text-black font-semibold">
            Original Brand + Model + Name
          </TableHead>
          <TableHead className="py-3 px-4 border-r text-start text-black font-semibold">
            Updated Field
          </TableHead>
          <TableHead className="py-3 px-4 border-r text-start text-black font-semibold">
            Old data
          </TableHead>
          <TableHead className="py-3 px-4 text-start text-black font-semibold">
            New data
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {updatedFields.map((change, index) => (
          <TableRow key={index}>
            <TableCell className="text-xs py-2 px-4 border-r">
              {data.oldData.category}
            </TableCell>
            <TableCell className="text-xs py-2 px-4 border-r">
              {[
                data.oldData.attributes?.find((attr) => attr.key === "brand")
                  ?.value,
                data.oldData.attributes?.find((attr) => attr.key === "model")
                  ?.value,
                data.oldData.name,
              ]
                .filter(Boolean)
                .join(" ")}
            </TableCell>
            <TableCell className="text-xs py-2 px-4 border-r">
              {change.field}
            </TableCell>
            <TableCell className="text-xs py-2 px-4 border-r">
              {formatValue(change.oldValue, change.field)}
            </TableCell>
            <TableCell className="text-xs py-2 px-4">
              {formatValue(change.newValue, change.field)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default UpdateAssetsTable;
