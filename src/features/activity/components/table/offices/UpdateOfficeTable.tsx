import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  countriesByCode,
} from "@/shared";

import { Office } from "@/features/settings";

interface OfficesTableProps {
  data: {
    oldData: Office;
    newData: Office;
  };
}

const getUpdatedFields = (oldData: Office, newData: Office) => {
  const changes: { field: string; oldValue: any; newValue: any }[] = [];

  const allKeys = new Set([
    ...Object.keys(oldData || {}),
    ...Object.keys(newData || {}),
  ]);

  allKeys.forEach((key) => {
    if (["updatedAt", "createdAt", "deletedAt", "_id"].includes(key)) {
      return;
    }

    const oldValue = oldData[key as keyof Office];
    const newValue = newData[key as keyof Office];

    if (key === "isDefault") {
      const oldDefault = (oldValue as boolean) ? "Yes" : "No";
      const newDefault = (newValue as boolean) ? "Yes" : "No";

      if (oldDefault !== newDefault) {
        changes.push({
          field: key,
          oldValue: oldDefault,
          newValue: newDefault,
        });
      }
    } else {
      let hasChanged = false;

      if (
        key === "name" ||
        key === "email" ||
        key === "phone" ||
        key === "address" ||
        key === "apartment" ||
        key === "city" ||
        key === "state" ||
        key === "country" ||
        key === "zipCode"
      ) {
        hasChanged = oldValue !== newValue;
      }

      if (hasChanged) {
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

const fieldTranslations: { [key: string]: string } = {
  name: "Office Name",
  email: "Email",
  phone: "Phone",
  address: "Address",
  apartment: "Apartment",
  city: "City",
  state: "State",
  country: "Country",
  zipCode: "ZIP Code",
  isDefault: "Default Office",
};

const translateField = (field: string) => {
  return fieldTranslations[field] || field;
};

const formatValue = (value: any, field?: string) => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  if (field === "isDefault") {
    return value ? "Yes" : "No";
  }

  if (field === "country") {
    return countriesByCode[value as string] || value;
  }

  return value.toString();
};

const UpdateOfficesTable: React.FC<OfficesTableProps> = ({ data }) => {
  const updatedFields = getUpdatedFields(data.oldData, data.newData);

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-light-grey border-gray-200 rounded-md">
          <TableHead className="px-4 py-3 border-r font-semibold text-black text-start">
            Original Name
          </TableHead>
          <TableHead className="px-4 py-3 border-r font-semibold text-black text-start">
            Country
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
        {updatedFields.map((change, index) => (
          <TableRow key={index}>
            <TableCell className="px-4 py-2 border-r text-xs">
              {data.oldData.name}
            </TableCell>
            <TableCell className="px-4 py-2 border-r text-xs">
              {data.oldData.country
                ? countriesByCode[data.oldData.country] || data.oldData.country
                : "-"}
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

export default UpdateOfficesTable;
