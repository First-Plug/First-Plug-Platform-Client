import { PRODUCT_STATUSES } from "@/features/assets";
import { CATEGORIES } from "@/features/assets/interfaces/product";
import { TableType } from "@/shared";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from "@/shared";

import { SelectLabel } from "@radix-ui/react-select";
import { useFetchTeams } from "@/features/teams";
interface ISelectFilter {
  tableType: TableType;
  onValueChange: (value) => void;
  value: string;
}
export default function SelectFilter({
  tableType,
  onValueChange,
  value,
}: ISelectFilter) {
  const { data: teams } = useFetchTeams();
  switch (tableType) {
    case "members": {
      return (
        <Select onValueChange={(value) => onValueChange(value)}>
          <SelectTrigger className="bg-white text-xs">
            <SelectValue placeholder="Filter by Team" />
          </SelectTrigger>
          <SelectContent className="bg-white text-xs">
            <SelectGroup>
              <SelectLabel className="px-2 py-1 font-semibold">
                Teams
              </SelectLabel>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Not Assigned">Not Assigned</SelectItem>
              {teams.map((t) => (
                <SelectItem value={t._id} key={t._id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      );
    }
    case "stock": {
      return (
        <Select onValueChange={(value) => onValueChange(value)}>
          <SelectTrigger className="bg-white text-xs">
            <SelectValue placeholder="Filter by Category" />
          </SelectTrigger>
          <SelectContent className="bg-white text-xs">
            <SelectGroup>
              <SelectLabel className="px-2 py-1 font-semibold">
                Categories
              </SelectLabel>
              <SelectItem value="all">All</SelectItem>
              {CATEGORIES.map((t) => (
                <SelectItem value={t} key={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      );
    }
    case "subRow": {
      return (
        <Select onValueChange={(value) => onValueChange(value)}>
          <SelectTrigger className="bg-white text-xs">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent className="bg-white text-xs">
            <SelectGroup>
              <SelectLabel className="px-2 py-1 font-semibold">
                Statuses
              </SelectLabel>
              <SelectItem value="all" key={"all"}>
                All
              </SelectItem>

              {PRODUCT_STATUSES.filter((status) => status !== "Deprecated").map(
                (t) => (
                  <SelectItem value={t} key={t}>
                    {t}
                  </SelectItem>
                )
              )}
            </SelectGroup>
          </SelectContent>
        </Select>
      );
    }
  }
}
