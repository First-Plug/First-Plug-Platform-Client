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
    if (key === "attributes") {
      const oldAttributes = oldData.attributes || [];
      const newAttributes = newData.attributes || [];

      newAttributes.forEach((newAttr) => {
        const oldAttr = oldAttributes.find((attr) => attr.key === newAttr.key);
        if (!oldAttr || oldAttr.value !== newAttr.value) {
          changes.push({
            field: `Attribute: ${newAttr.key}`,
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

      if (oldValue !== newValue) {
        let formattedOldValue = oldValue || "-";
        let formattedNewValue = newValue || "-";

        if (
          ["updatedAt", "createdAt", "acquisitionDate", "deletedAt"].includes(
            key
          )
        ) {
          if (typeof formattedOldValue === "string" && formattedOldValue)
            formattedOldValue = new Date(formattedOldValue).toLocaleString();
          if (typeof formattedNewValue === "string" && formattedNewValue)
            formattedNewValue = new Date(formattedNewValue).toLocaleString();
        }

        changes.push({
          field: key,
          oldValue: formattedOldValue,
          newValue: formattedNewValue,
        });
      }
    }
  });

  return changes;
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
              {data.newData.category}
            </TableCell>
            <TableCell className="text-xs py-2 px-4 border-r">
              {[
                data.newData.attributes?.find((attr) => attr.key === "brand")
                  ?.value,
                data.newData.attributes?.find((attr) => attr.key === "model")
                  ?.value,
                data.newData.name,
              ]
                .filter(Boolean)
                .join(" ")}
            </TableCell>
            <TableCell className="text-xs py-2 px-4 border-r">
              {change.field}
            </TableCell>
            <TableCell className="text-xs py-2 px-4 border-r">
              {change.oldValue}
            </TableCell>
            <TableCell className="text-xs py-2 px-4">
              {change.newValue}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default UpdateAssetsTable;
