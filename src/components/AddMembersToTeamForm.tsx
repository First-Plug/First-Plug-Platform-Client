"use client";
import { useState, useEffect } from "react";
import { Button, LoaderSpinner, SearchInput } from "@/common";
import { Team, TeamMember } from "@/types";
import { observer } from "mobx-react-lite";
import { TeamServices } from "@/services";
import { MemberItem } from "./AsideContents/EditTeamAside";
import { useStore } from "@/models";
import { transformData } from "@/utils/dataTransformUtil";
import useFetch from "@/hooks/useFetch";
import { Skeleton } from "./ui/skeleton";

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
    teams: { teams },
  } = useStore();
  const { fetchMembers } = useFetch();
  const [searchedMembers, setSearchedMembers] = useState<TeamMember[]>(members);
  const [currentMembers, setCurrentMembers] = useState<TeamMember[]>(members);
  const [membersToAdd, setMembersToAdd] = useState<TeamMember[]>([]);
  const [memberToDelete, setMembersToDelete] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);

  const setInitialData = () => {
    const initialSelectedMembers = members.filter(
      (member) =>
        member.team &&
        typeof member.team === "object" &&
        member.team._id === team?._id
    );
    const transformedMembers = transformData(initialSelectedMembers, teams);
    setCurrentMembers(transformedMembers);
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
      if (memberToDelete.some((selected) => selected._id === member._id)) {
        setMembersToDelete(memberToDelete.filter((m) => m._id !== member._id));
      } else {
        setMembersToDelete([...memberToDelete, member]);
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
      if (memberToDelete.length > 0) {
        const allMembersToDelete = memberToDelete.map((member) =>
          TeamServices.removeFromTeam(team._id, member._id)
        );
        await Promise.all(allMembersToDelete);
      }

      await fetchMembers();
      setInitialData();
    } catch (error) {
      return error;
    }
  };
  const handleConfirmChanges = async () => {
    setLoading(true);
    try {
      await editTeam();
      await fetchMembers();
    } catch (error) {
      setLoading(false);
      return error;
    } finally {
      setInitialData();
      setLoading(false);
    }
  };

  const confirmBtnStatus =
    membersToAdd.length === 0 && memberToDelete.length === 0; // USAR ESTE VALOR PARA DEFINIR SI HAY CAMBIOS EN LOS USER SELECCIONADOS.

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
            deleting={memberToDelete.some(
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
