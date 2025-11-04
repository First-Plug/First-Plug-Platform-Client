import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/shared";
import { type Price, type Product } from "@/features/assets";

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
  console.log(oldData, newData);
  const changes: { field: string; oldValue: any; newValue: any }[] = [];

  Object.keys({ ...oldData, ...newData }).forEach((key) => {
    if (["updatedAt", "createdAt", "deletedAt", "status"].includes(key)) {
      return;
    }

    if (key === "attributes") {
      const oldAttrs = oldData.attributes;
      const newAttrs = newData.attributes;

      // Normalizar ambos a objeto para comparación consistente
      let oldAttrsObj: Record<string, any> = {};
      let newAttrsObj: Record<string, any> = {};

      // Convertir oldAttrs a objeto
      if (Array.isArray(oldAttrs)) {
        oldAttrs.forEach((attr) => {
          oldAttrsObj[attr.key] = attr.value;
        });
      } else if (typeof oldAttrs === "object" && oldAttrs !== null) {
        oldAttrsObj = oldAttrs as any;
      }

      // Convertir newAttrs a objeto
      if (Array.isArray(newAttrs)) {
        newAttrs.forEach((attr) => {
          newAttrsObj[attr.key] = attr.value;
        });
      } else if (typeof newAttrs === "object" && newAttrs !== null) {
        newAttrsObj = newAttrs as any;
      }

      // Comparar todos los atributos
      const allKeys = new Set([
        ...Object.keys(oldAttrsObj),
        ...Object.keys(newAttrsObj),
      ]);

      allKeys.forEach((attrKey) => {
        const oldValue = oldAttrsObj[attrKey];
        const newValue = newAttrsObj[attrKey];

        if (oldValue !== newValue) {
          changes.push({
            field: attrKey,
            oldValue: oldValue ?? "-",
            newValue: newValue ?? "-",
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
          (oldValue as Price).amount !== (newValue as Price).amount ||
          (oldValue as Price).currencyCode !== (newValue as Price).currencyCode
        ) {
          changes.push({
            field: key,
            oldValue: `${(oldValue as Price).amount} ${
              (oldValue as Price).currencyCode
            }`,
            newValue: `${(newValue as Price).amount} ${
              (newValue as Price).currencyCode
            }`,
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

// Helper para obtener valor de atributo (maneja objeto y array)
const getAttributeValue = (
  attributes: any,
  key: string
): string | undefined => {
  if (!attributes) return undefined;

  // Si es array
  if (Array.isArray(attributes)) {
    return attributes.find((attr) => attr.key === key)?.value;
  }

  // Si es objeto
  if (typeof attributes === "object") {
    return attributes[key];
  }

  return undefined;
};

const UpdateAssetsTable: React.FC<AssetsTableProps> = ({ data }) => {
  console.log(data);
  const updatedFields = getUpdatedFields(data.oldData, data.newData);

  // Usar newData para campos que no cambiaron (category, name, serialNumber)
  // porque oldData solo contiene los campos que se actualizaron
  const productInfo = data.newData || data.oldData;

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
              {productInfo.category || "-"}
            </TableCell>
            <TableCell className="px-4 py-2 border-r text-xs">
              {[
                getAttributeValue(productInfo.attributes, "brand"),
                getAttributeValue(productInfo.attributes, "model"),
                productInfo.name,
              ]
                .filter(Boolean)
                .join(" ") || "-"}
            </TableCell>
            <TableCell className="px-4 py-2 border-r text-xs">
              {productInfo.serialNumber || "-"}
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
