"use client";
import React, { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "@/models/root.store";
import { TeamMember, Team } from "@/types";
import { AddMembersToTeamForm } from "./AddMembersToTeamForm";
import { transformData } from "@/utils/dataTransformUtil";
import { Button, LoaderSpinner } from "@/common";
import { TeamServices } from "@/services";
import { Input } from "./ui/input";
import { useQueryClient } from "@tanstack/react-query";

interface TeamInfoProps {
  team: Team;
  closeExpand: () => void;
}

export const TeamInfo = observer(function ({
  team,
  closeExpand,
}: TeamInfoProps) {
  const [newTeamName, setNewTeamName] = useState(team.name);
  const [updating, setUpdating] = useState(false);
  const queryClient = useQueryClient();

  const handleNewNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTeamName(e.target.value);
  };

  const handleUpdateTeamName = async () => {
    setUpdating(true);
    try {
      await TeamServices.updateTeam(team._id, { ...team, name: newTeamName });
      queryClient.invalidateQueries({ queryKey: ["members"] });
    } catch (error) {
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <article className="flex flex-col justify-between gap-2 w-[95%] m-auto my-2 text-md">
      <header className="flex flex-col gap-2 flex-grow ">
        <span className="text-grey">Team Name</span>
        <div className="relative flex items-center ">
          <div className="w-full">
            <Input
              type="text"
              className="text-md"
              value={newTeamName}
              onChange={handleNewNameChange}
            />
          </div>
          <div className="absolute right-2 flex items-center ">
            <Button
              variant="text"
              disabled={newTeamName === team.name || updating}
              onClick={handleUpdateTeamName}
            >
              {updating ? <LoaderSpinner /> : "save"}
            </Button>
          </div>
        </div>
      </header>

      <hr className="my-2" />

      <AddMembersToTeamForm
        isEditFlow={true}
        team={team}
        closeExpand={closeExpand}
      />
    </article>
  );
});
