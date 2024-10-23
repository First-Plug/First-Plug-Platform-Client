"use client";
import React, { useState } from "react";
import { Button, LoaderSpinner } from "@/common";
import { TeamServices } from "../../services";
import { observer } from "mobx-react-lite";
import { useStore } from "@/models/root.store";
import { Team } from "@/types/teams";
import { TeamDetails } from "..";
import { TeamMember } from "@/types";
import { transformData } from "@/utils/dataTransformUtil";
import { DeleteAction } from "../Alerts";
import { useQueryClient } from "@tanstack/react-query";
import { useFetchMembers } from "@/members/hooks";
import { useFetchTeams, useDeleteTeam } from "@/teams/hooks";

interface EditTeamsAsideProps {
  className?: string | "";
  members?: TeamMember[];
}

export const EditTeamsAside = observer(function ({
  className,
  members,
}: EditTeamsAsideProps) {
  const {
    teams: { setTeams, teams },
    alerts: { setAlert },
    members: { setMembers },
  } = useStore();

  const queryClient = useQueryClient();
  const { data: membersData, isLoading: isLoadingMembers } = useFetchMembers();
  const { data: teamsData, isLoading: isLoadingTeams } = useFetchTeams();

  if (membersData) {
    setMembers(membersData);
  }

  if (teamsData) {
    setTeams(teamsData);
  }

  const [selectedTeams, setSelectedTeams] = useState<Team[]>([]);
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);

  const [isUpdating, setIsUpdating] = useState(false);

  const handleCheckbox = (team: Team) => {
    setSelectedTeams((prevSelectedTeams) => {
      const isSelected = prevSelectedTeams.some(
        (selected) => selected._id === team._id
      );

      if (isSelected) {
        return prevSelectedTeams.filter(
          (selected) => selected._id !== team._id
        );
      } else {
        return [...prevSelectedTeams, team];
      }
    });
  };

  const handleExpandTeam = (team: Team) => {
    if (expandedTeamId !== team._id) {
      setExpandedTeamId(team._id);
    } else {
      setExpandedTeamId(null);
    }
  };

  const handleDeleteSelectedTeams = async () => {
    setIsUpdating(true);
    try {
      await TeamServices.bulkDeleteTeams(selectedTeams.map((team) => team._id));

      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      // const transformedMembers = transformData(updatedMembers, updatedTeams);
      // queryClient.invalidateQueries({ queryKey: ["members"] });
      // setTeams(updatedTeams);
      // setMembers(transformedMembers);
      setAlert("deleteTeam");
      setSelectedTeams([]);
    } catch (error) {
      console.error("Error deleting teams:", error);
      setAlert("errorDeleteTeam");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className={` ${className} flex flex-col justify-between h-full `}>
      <div className="flex flex-col gap-2  h-full max-h-[100%] overflow-y-auto scrollbar-custom">
        {teams.map((team) => (
          <TeamDetails
            key={team._id}
            team={team}
            handleCheckbox={handleCheckbox}
            handleExpandTeam={handleExpandTeam}
            isExpanded={expandedTeamId === team._id}
          />
        ))}
      </div>

      <div className="flex gap-2  absolute  bg-white  py-2    bottom-0   left-0 w-full border-t px-4">
        <div className="flex    w-5/6 mx-auto gap-2 justify-end">
          <DeleteAction
            type="team"
            id={selectedTeams.map((team) => team._id).join(",")}
            onConfirm={handleDeleteSelectedTeams}
            trigger={
              <Button
                variant="delete"
                disabled={selectedTeams.length === 0 || isUpdating}
                size="big"
                className="flex-grow w-full rounded-md"
              >
                {isUpdating ? <LoaderSpinner /> : "Delete"}
              </Button>
            }
          />
        </div>
      </div>
    </div>
  );
});
