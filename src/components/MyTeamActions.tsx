"use client";
import { AddIcon, Button, PenIcon, SearchInput, TeamCard } from "@/common";
import { useStore } from "@/models";
import { AsideType } from "@/types";
import { observer } from "mobx-react-lite";
import { Table } from "@tanstack/react-table";
import { MyTeamViewHeader } from "./MyTeamViewHeader";

interface MyTeamActionsProps<TData> {
  table: Table<TData>;
}
export const MyTeamActions = observer(function <TData>({
  table,
}: MyTeamActionsProps<TData>) {
  const {
    teams: { teams },
    aside: { setAside },
  } = useStore();
  const handleAside = (type: AsideType) => {
    setAside(type);
  };

  return (
    <section className="flex flex-col gap-1 w-full h-full">
      <MyTeamViewHeader />

      <div className="w-full flex justify-between  items-center    gap-2  ">
        <div className="flex gap-2 items-center ">
          <SearchInput
            placeholder="Search by Name"
            onSearch={(value) => table.getColumn("name")?.setFilterValue(value)}
          />
        </div>

        <div className="flex gap-2 items-center ">
          <Button
            body="Create Team"
            variant={"text"}
            icon={<AddIcon />}
            className={"p-2 text-sm rounded-md"}
            onClick={() => handleAside("NewTeam")}
          />
          <Button
            body="Edit Team"
            variant={"text"}
            disabled={teams.length === 0}
            icon={<PenIcon />}
            className={"p-2 text-sm rounded-md"}
            onClick={() => handleAside("EditTeam")}
          />
        </div>
      </div>
    </section>
  );
});
