"use client";
import React, { useState } from "react";
import { Button, LoaderSpinner } from "@/common";
import { Memberservices, TeamServices } from "../services";
import { observer } from "mobx-react-lite";
import { useStore } from "@/models/root.store";
import { Team } from "@/types/teams";
import { TeamDetails } from ".";
import { TeamMember } from "@/types";
import { transformData } from "@/utils/dataTransformUtil";
import { DeleteAction } from "./Alerts";
import useFetch from "@/hooks/useFetch";

interface EditTeamsAsideDetailsProps {
  className?: string | "";
  members?: TeamMember[];
}

export const EditTeamsAsideDetails = observer(function ({
  className,
  members,
}: EditTeamsAsideDetailsProps) {
  const {
    teams: { setTeams, teams, updateTeam },
    alerts: { setAlert },
    members: { setMembers },
    aside: { setAside },
  } = useStore();

  const { fetchMembers } = useFetch();

  const [selectedTeams, setSelectedTeams] = useState<Team[]>([]);
  const [newName, setNewName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<TeamMember[]>([]);
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
      setNewName(team.name);
      setSelectedMembers(
        members?.filter(
          (member) =>
            member.team &&
            typeof member.team === "object" &&
            (member.team as Team)._id === team._id
        ) || []
      );
    } else {
      setExpandedTeamId(null);
    }
  };

  const handleDeleteSelectedTeams = async () => {
    setIsUpdating(true);
    try {
      await TeamServices.bulkDeleteTeams(selectedTeams.map((team) => team._id));

      const updatedMembers = await Memberservices.getAllMembers();
      const updatedTeams = await TeamServices.getAllTeams();
      const transformedMembers = transformData(updatedMembers, updatedTeams);
      await fetchMembers();
      setTeams(updatedTeams);
      setMembers(transformedMembers);
      setAlert("deleteTeam");
      setSelectedTeams([]);
    } catch (error) {
      console.error("Error deleting teams:", error);
      setAlert("errorDeleteTeam");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateTeam = async () => {
    if (!expandedTeamId) return;
    setIsUpdating(true);
    try {
      const teamToUpdate = teams.find(
        (team) => team._id === expandedTeamId
      ) as Team;
      if (!teamToUpdate) return;

      const updatedTeam = { ...teamToUpdate, name: newName };

      await TeamServices.updateTeam(updatedTeam._id, updatedTeam);
      const memberUpdates = selectedMembers.map((member) =>
        TeamServices.associateTeamToMember(updatedTeam._id, member._id)
      );
      await Promise.all(memberUpdates);
      const updatedTeams = await TeamServices.getAllTeams();
      const updatedMembers = await Memberservices.getAllMembers();

      const transformedMembers = transformData(updatedMembers, updatedTeams);
      await fetchMembers();
      updateTeam(updatedTeam);
      setTeams(updatedTeams);
      setMembers(transformedMembers);
      setTeams(updatedTeams);
      setAlert("updateTeam");
      setAside(undefined);
    } catch (error) {
      setAlert("errorUpdateTeam");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className={` ${className} flex flex-col justify-between h-full `}>
      <div className="flex flex-col gap-2 h-[70vh] overflow-y-auto scrollbar-custom">

        {teams.map((team) => (
          <TeamDetails
            key={team._id}
            team={team}
            members={members}
            handleCheckbox={handleCheckbox}
            handleExpandTeam={handleExpandTeam}
            isExpanded={expandedTeamId === team._id}
            setNewName={setNewName}
            setSelectedMembers={setSelectedMembers}
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
          <Button
            variant="primary"
            size="big"
            className="flex-grow w-full rounded-md"
            onClick={handleUpdateTeam}
            disabled={isUpdating}
          >
            {isUpdating ? <LoaderSpinner /> : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
});
