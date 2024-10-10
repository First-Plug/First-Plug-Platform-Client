"use client";
import { useState, useEffect } from "react";
import { Button, LoaderSpinner, SearchInput } from "@/common";
import { Team, TeamMember } from "@/types";
import { observer } from "mobx-react-lite";
import { MemberItem } from "./AsideContents/EditTeamAside";
import { useStore } from "@/models";
import { transformData } from "@/utils/dataTransformUtil";
import { Skeleton } from "./ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { useAddToTeam, useRemoveFromTeam } from "@/teams/hooks";
import { TeamServices } from "@/services";

interface AddMembersToTeamFormProps {
  selectedMembers?: TeamMember[];
  handleSelectedMembers?: (member: TeamMember) => void;
  isEditFlow?: boolean;
  team?: Team;
  newTeamName?: string;
  closeExpand?: () => void;
  createAside?: boolean;
}

export const AddMembersToTeamForm = observer(function ({
  createAside = false,
  team,
  newTeamName,
  handleSelectedMembers,
}: AddMembersToTeamFormProps) {
  const {
    members: { members },
  } = useStore();
  const queryClient = useQueryClient();
  const addToTeamMutation = useAddToTeam();
  const removeFromTeamMutation = useRemoveFromTeam();

  const [searchedMembers, setSearchedMembers] = useState<TeamMember[]>(members);
  const [currentMembers, setCurrentMembers] = useState<TeamMember[]>(members);
  const [membersToAdd, setMembersToAdd] = useState<TeamMember[]>([]);
  const [membersToDelete, setMembersToDelete] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);

  const setInitialData = () => {
    const initialSelectedMembers = members.filter(
      (member) =>
        member.team &&
        typeof member.team === "object" &&
        member.team._id === team?._id
    );
    // const transformedMembers = transformData(initialSelectedMembers, teams);
    setCurrentMembers(initialSelectedMembers);
    setSearchedMembers(members);
    setMembersToAdd([]);
    setMembersToDelete([]);
  };
  useEffect(() => {
    setInitialData();
  }, []);

  const handleSearch = (query: string) => {
    setSearchedMembers(
      members.filter(
        (member) =>
          member.firstName.toLowerCase().includes(query.toLowerCase()) ||
          member.lastName.toLowerCase().includes(query.toLowerCase()) ||
          member.email.toLowerCase().includes(query.toLowerCase())
      )
    );
  };

  const toggleMemberSelection = (member: TeamMember) => {
    if (createAside) {
      handleSelectedMembers(member);
    }
    const isCurrent = currentMembers.some(
      (selected) => selected._id === member._id
    );
    if (isCurrent) {
      if (membersToDelete.some((selected) => selected._id === member._id)) {
        setMembersToDelete(membersToDelete.filter((m) => m._id !== member._id));
      } else {
        setMembersToDelete([...membersToDelete, member]);
      }
    } else {
      if (membersToAdd.some((selected) => selected._id === member._id)) {
        setMembersToAdd(membersToAdd.filter((m) => m._id !== member._id));
      } else {
        setMembersToAdd([...membersToAdd, member]);
      }
    }
  };

  const editTeam = async () => {
    try {
      if (membersToAdd.length > 0) {
        const allMembersToAdd = membersToAdd.map((member) =>
          TeamServices.addToTeam(team._id, member._id)
        );
        await Promise.all(allMembersToAdd);
      }
      if (membersToDelete.length > 0) {
        const allMembersToDelete = membersToDelete.map((member) =>
          TeamServices.removeFromTeam(team._id, member._id)
        );
        await Promise.all(allMembersToDelete);
      }

      await queryClient.invalidateQueries({ queryKey: ["members"] });
      await queryClient.invalidateQueries({ queryKey: ["teams"] });
      setInitialData();
    } catch (error) {
      return error;
    }
  };
  const handleConfirmChanges = async () => {
    setLoading(true);
    try {
      await editTeam();
    } catch (error) {
      setLoading(false);
      return error;
    } finally {
      setInitialData();
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    };
  }, [queryClient]);

  const confirmBtnStatus =
    membersToAdd.length === 0 && membersToDelete.length === 0; // USAR ESTE VALOR PARA DEFINIR SI HAY CAMBIOS EN LOS USER SELECCIONADOS.

  return (
    <section className="flex flex-col gap-4 h-full">
      <div className="flex justify-between">
        <SearchInput
          placeholder="Search Member"
          onSearch={handleSearch}
          className={`${!createAside ? "w-2/3" : "w-full"}`}
        />
        {!createAside && (
          <Button
            variant="primary"
            disabled={confirmBtnStatus || loading}
            className="text-xs "
            onClick={handleConfirmChanges}
          >
            {loading ? <LoaderSpinner /> : "Confirm changes"}
          </Button>
        )}
      </div>
      <div className="flex flex-col gap-2 flex-grow overflow-y-auto scrollbar-custom">
        {searchedMembers.map((member) => (
          <MemberItem
            key={member._id}
            isChanging={loading}
            member={member}
            adding={membersToAdd.some(
              (selected) => selected._id === member._id
            )}
            deleting={membersToDelete.some(
              (selected) => selected._id === member._id
            )}
            isCurrent={currentMembers.some(
              (selected) => selected._id === member._id
            )}
            handleSelectMember={toggleMemberSelection}
          />
        ))}
      </div>
    </section>
  );
});
