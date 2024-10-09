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
  }, [members, team]);

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

  const handleConfirmChanges = async () => {
    setLoading(true);
    try {
      if (membersToAdd.length > 0) {
        await Promise.all(
          membersToAdd.map((member) =>
            addToTeamMutation.mutateAsync({
              teamId: team._id,
              memberId: member._id,
            })
          )
        );
      }
      if (membersToDelete.length > 0) {
        await Promise.all(
          membersToDelete.map((member) =>
            removeFromTeamMutation.mutateAsync({
              teamId: team._id,
              memberId: member._id,
            })
          )
        );
      }

      await queryClient.invalidateQueries({ queryKey: ["members"] });
      setInitialData();
    } catch (error) {
      console.error("Error applying team changes:", error);
    } finally {
      setLoading(false);
    }
  };

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
