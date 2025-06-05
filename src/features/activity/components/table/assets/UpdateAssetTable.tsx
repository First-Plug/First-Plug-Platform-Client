import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/shared";
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
    if (["updatedAt", "createdAt", "deletedAt", "status"].includes(key)) {
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

  if (field === "acquisitionDate") {
    if (typeof value === "string") {
      const dateMatch = value.match(/\d{4}-\d{2}-\d{2}/);
      if (dateMatch) {
        const [year, month, day] = dateMatch[0].split("-");
        return `${day}/${month}/${year}`;
      }
      return "-";
    }

    if (value instanceof Date && !isNaN(value.getTime())) {
      return value.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }
  }

  return value || "-";
};

const fieldTranslations: { [key: string]: string } = {
  brand: "Brand",
  model: "Model",
  name: "Name",
  price: "Price",
  processor: "Processor",
  ram: "RAM",
  storage: "Storage",
  recoverable: "Recoverable",
  acquisitionDate: "Acquisition Date",
  color: "Color",
  gpu: "GPU",
  keyboardLanguage: "Keyboard Language",
  additionalInfo: "Additional Info",
  productCondition: "Product Condition",
  serialNumber: "Serial Number",
  screen: "Screen",
};

const translateField = (field: string) => {
  return fieldTranslations[field] || field;
};

const UpdateAssetsTable: React.FC<AssetsTableProps> = ({ data }) => {
  const updatedFields = getUpdatedFields(data.oldData, data.newData);

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-light-grey border-gray-200 rounded-md">
          <TableHead className="px-4 py-3 border-r font-semibold text-black text-start">
            Category
          </TableHead>
          <TableHead className="px-4 py-3 border-r font-semibold text-black text-start">
            Original Brand + Model + Name
          </TableHead>
          <TableHead className="px-4 py-3 border-r font-semibold text-black text-start">
            Original Serial
          </TableHead>
          <TableHead className="px-4 py-3 border-r font-semibold text-black text-start">
            Updated Field
          </TableHead>
          <TableHead className="px-4 py-3 border-r font-semibold text-black text-start">
            Old data
          </TableHead>
          <TableHead className="px-4 py-3 font-semibold text-black text-start">
            New data
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {updatedFields.map((change, index) => (
          <TableRow key={index}>
            <TableCell className="px-4 py-2 border-r text-xs">
              {data.oldData.category}
            </TableCell>
            <TableCell className="px-4 py-2 border-r text-xs">
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
            <TableCell className="px-4 py-2 border-r text-xs">
              {data.oldData.serialNumber || "-"}
            </TableCell>
            <TableCell className="px-4 py-2 border-r text-xs">
              {translateField(change.field)}
            </TableCell>
            <TableCell className="px-4 py-2 border-r text-xs">
              {formatValue(change.oldValue, change.field)}
            </TableCell>
            <TableCell className="px-4 py-2 text-xs">
              {formatValue(change.newValue, change.field)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default UpdateAssetsTable;
