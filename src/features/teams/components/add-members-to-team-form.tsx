"use client";
import { useState, useEffect } from "react";
import { Button, LoaderSpinner, SearchInput } from "@/shared";

import { MemberItem } from "@/features/members";

import { useQueryClient } from "@tanstack/react-query";
import { useAddToTeam, useRemoveFromTeam, type Team } from "@/features/teams";
import { TeamServices } from "@/services";
import { Member } from "@/features/members";
import { useFetchMembers } from "@/features/members";

interface AddMembersToTeamFormProps {
  selectedMembers?: Member[];
  handleSelectedMembers?: (member: Member) => void;
  isEditFlow?: boolean;
  team?: Team;
  newTeamName?: string;
  closeExpand?: () => void;
  createAside?: boolean;
}

export const AddMembersToTeamForm = function ({
  createAside = false,
  team,
  newTeamName,
  handleSelectedMembers,
}: AddMembersToTeamFormProps) {
  const { data: members } = useFetchMembers();

  const queryClient = useQueryClient();
  const addToTeamMutation = useAddToTeam();
  const removeFromTeamMutation = useRemoveFromTeam();

  const [searchedMembers, setSearchedMembers] = useState<Member[]>(members);
  const [currentMembers, setCurrentMembers] = useState<Member[]>(members);
  const [membersToAdd, setMembersToAdd] = useState<Member[]>([]);
  const [membersToDelete, setMembersToDelete] = useState<Member[]>([]);
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

  const toggleMemberSelection = (member: Member) => {
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
      if (membersToAdd.length > 0 || membersToDelete.length > 0) {
        queryClient.invalidateQueries({ queryKey: ["members"] });
        queryClient.invalidateQueries({ queryKey: ["teams"] });
      }
    };
  }, [membersToAdd, membersToDelete, queryClient]);

  const confirmBtnStatus =
    membersToAdd.length === 0 && membersToDelete.length === 0;

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
            className="text-xs"
            onClick={handleConfirmChanges}
          >
            {loading ? <LoaderSpinner /> : "Confirm changes"}
          </Button>
        )}
      </div>
      <div className="flex flex-col flex-grow gap-2 overflow-y-auto scrollbar-custom">
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
};
