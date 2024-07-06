"use client";
/*global.css*/
import React, { useState } from "react";
import { Button, LoaderSpinner } from "@/common";
import { Memberservices, TeamServices } from "../services";
import { observer } from "mobx-react-lite";
import { useStore } from "@/models/root.store";
import { TeamMember } from "@/types";
import { AddMembersToTeamForm } from "./AddMembersToTeamForm";
import { transformData } from "@/utils/dataTransformUtil";
import useFetch from "@/hooks/useFetch";

interface CreateTeamAsideProps {
  className?: string;
}

export const CreateTeamAside = observer(function ({
  className = "",
}: CreateTeamAsideProps) {
  const {
    aside: { setAside },
    members: { memberCount, setMembers, members },
    teams: { setTeams, createTeam, addToTeam },
    alerts: { setAlert },
  } = useStore();

  const [name, setName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<TeamMember[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const handleSelectedMembers = (member: TeamMember) => {
    if (selectedMembers.some((m) => m._id === member._id)) {
      return setSelectedMembers(
        selectedMembers.filter((m) => m._id !== member._id)
      );
    }
    setSelectedMembers([...selectedMembers, member]);
  };

  const { fetchMembers } = useFetch();
  const handleCreateTeam = async () => {
    setIsCreating(true);
    try {
      const newTeam = await createTeam({ name });
      if (selectedMembers.length) {
        const memberUpdates = selectedMembers.map(async (member) => {
          return await addToTeam(newTeam._id, member._id);
        });
        await Promise.all(memberUpdates);
      }
      await fetchMembers();
      setAlert("createTeam");
      setAside(undefined);
    } catch (error) {
      console.error("Error creating team:", error);
      setAlert("errorCreateTeam");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className={` ${className} flex flex-col justify-between h-full `}>
      <div className="flex flex-col gap-2  h-full max-h-[100%] overflow-y-auto scrollbar-custom">
        <div className="flex flex-col">
          <span className="text-dark-grey">Team Name</span>

          <input
            type="text"
            className="border-2 rounded-xl p-2 flex-grow w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <hr className="my-3" />
        <div className="flex flex-col gap-2">
          <div className="flex justify-between">
            <span>Assign Members to Team</span>
            <span>({memberCount})</span>
          </div>

          <AddMembersToTeamForm
            handleSelectedMembers={handleSelectedMembers}
            selectedMembers={selectedMembers}
            createAside
            newTeamName={name}
          />
        </div>
      </div>

      <div className="flex gap-2  absolute  bg-white  py-2    bottom-0   left-0 w-full border-t px-4">
        <div className="flex  justify-end  w-full gap-2 ">
          <Button
            variant="secondary"
            size="big"
            className="flex-grow rounded-md w-1/3"
            onClick={() => setAside(undefined)}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="big"
            className="flex-grow rounded-md w-1/3"
            disabled={!name || isCreating}
            onClick={handleCreateTeam}
          >
            {isCreating ? <LoaderSpinner /> : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
});
