"use client";
import { AddIcon, Button, PenIcon } from "@/shared";

import { AsideType } from "@/features/asides";

import { MyTeamViewHeader } from "./my-team-view-header";
import { usePrefetchTeams } from "@/features/teams";

import { useQueryClient } from "@tanstack/react-query";
import { useAsideStore } from "@/shared";

export const MyTeamActions = function () {
  const { setAside } = useAsideStore();

  const queryClient = useQueryClient();
  const prefetchTeams = usePrefetchTeams();

  const handleAside = async (type: AsideType) => {
    const cachedData = queryClient.getQueryData(["teams"]);
    if (!cachedData) {
      await queryClient.fetchQuery({
        queryKey: ["teams"],
        queryFn: prefetchTeams,
      });
    }
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
      <div className="flex justify-between items-center gap-2 w-full">
        <div className="flex items-center gap-2">
          {/* <SearchInput
            placeholder="Search by Name"
            onSearch={(value) => table.getColumn("name")?.setFilterValue(value)}
          /> */}
        </div>

        <div className="flex items-center gap-2">
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
};
