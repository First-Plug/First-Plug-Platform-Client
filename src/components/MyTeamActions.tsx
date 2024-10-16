"use client";
import { AddIcon, Button, PenIcon, SearchInput, TeamCard } from "@/common";
import { useStore } from "@/models";
import { AsideType } from "@/types";
import { observer } from "mobx-react-lite";
import { Table } from "@tanstack/react-table";
import { MyTeamViewHeader } from "./MyTeamViewHeader";
import { useFetchTeams, usePrefetchTeams } from "@/teams/hooks";
import { BarLoader } from "./Loader/BarLoader";

interface MyTeamActionsProps<TData> {
  table: Table<TData>;
}
export const MyTeamActions = observer(function <TData>({
  table,
}: MyTeamActionsProps<TData>) {
  const {
    aside: { setAside },
  } = useStore();

  // const { data: teamData, isLoading, isError } = useFetchTeams();
  const prefetchTeams = usePrefetchTeams();

  // if (isLoading) return <BarLoader />;
  // if (isError) return <div>Failed to load teams</div>;

  const handleAside = (type: AsideType) => {
    setAside(type);
  };

  const handleEditTeamHover = () => {
    prefetchTeams();
  };

  return (
    <section className="flex flex-col gap-1 w-full h-full">
      <MyTeamViewHeader />
      {/* {isLoading ? (
        <BarLoader />
      ) : ( */}
      <div className="w-full flex justify-between  items-center    gap-2  ">
        <div className="flex gap-2 items-center ">
          {/* <SearchInput
            placeholder="Search by Name"
            onSearch={(value) => table.getColumn("name")?.setFilterValue(value)}
          /> */}
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
            // disabled={teamData.length === 0}
            icon={<PenIcon />}
            className={"p-2 text-sm rounded-md"}
            onMouseEnter={handleEditTeamHover}
            onClick={() => handleAside("EditTeam")}
          />
        </div>
      </div>
      {/* )} */}
    </section>
  );
});
