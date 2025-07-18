import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/shared";
import { type Member } from "@/features/members";
import { type Team } from "@/features/teams";

interface MembersTableProps {
  data: {
    oldData: Member;
    newData: Member;
  };
}

const getUpdatedFields = (oldData: Member, newData: Member) => {
  const changes: { field: string; oldValue: any; newValue: any }[] = [];

  const allKeys = new Set([
    ...Object.keys(oldData || {}),
    ...Object.keys(newData || {}),
  ]);
  allKeys.forEach((key) => {
    if (["updatedAt", "createdAt", "deletedAt"].includes(key)) {
      return;
    }

    const oldValue = oldData[key as keyof Member];
    const newValue = newData[key as keyof Member];

    if (key === "team") {
      const oldTeamName = (oldValue as Team)?.name || "-";
      const newTeamName = (newValue as Team)?.name || "-";

      if (oldTeamName !== newTeamName) {
        changes.push({
          field: key,
          oldValue: oldTeamName,
          newValue: newTeamName,
        });
      }
    } else {
      if (key !== "products") {
        let hasChanged = false;

        if (key === "birthDate" || key === "startDate") {
          const oldDate =
            oldValue && typeof oldValue === "string"
              ? new Date(oldValue).toISOString().split("T")[0]
              : null;
          const newDate =
            newValue && typeof newValue === "string"
              ? new Date(newValue).toISOString().split("T")[0]
              : null;
          hasChanged = oldDate !== newDate;
        } else {
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
    }
  });

  return changes;
};

const fieldTranslations: { [key: string]: string } = {
  firstName: "First Name",
  lastName: "Last Name",
  email: "Email",
  personalEmail: "Personal Email",
  position: "Position",
  phone: "Phone",
  city: "City",
  zipCode: "Zip Code",
  address: "Address",
  apartment: "Apartment",
  startDate: "Start Date",
  additionalInfo: "Additional Info",
  birthDate: "Birthdate",
  team: "Team",
  dni: "DNI",
};

const translateField = (field: string) => {
  return fieldTranslations[field] || field;
};

const formatValue = (value: any, field?: string) => {
  if (field === "birthDate" || field === "startDate") {
    if (typeof value === "string") {
      if (value.includes("T") && value.includes("Z")) {
        try {
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            return date.toLocaleDateString("es-ES", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            });
          }
        } catch (error) {
          console.error("Error parsing date:", error);
        }
      }

      const parts = value.split("-");
      if (parts.length === 3) {
        const [year, month, day] = parts;
        if (year && month && day) {
          return `${day}/${month}/${year}`;
        }
      }

      return value || "-";
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

const UpdateMembersTable: React.FC<MembersTableProps> = ({ data }) => {
  const updatedFields = getUpdatedFields(data.oldData, data.newData);

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-light-grey border-gray-200 rounded-md">
          <TableHead className="px-4 py-3 border-r font-semibold text-black text-start">
            Original name
          </TableHead>
          <TableHead className="px-4 py-3 border-r font-semibold text-black text-start">
            Original Assigned email
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
              {data.oldData.firstName + " " + data.oldData.lastName}
            </TableCell>
            <TableCell className="px-4 py-2 border-r text-xs">
              {data.oldData.email}
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

export default UpdateMembersTable;
