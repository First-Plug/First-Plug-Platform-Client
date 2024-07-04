"use client";
import React, { useState, useEffect } from "react";
import { SearchInput, TrashIcon } from "@/common";
import { TeamMember } from "@/types";
import { observer } from "mobx-react-lite";
import { DeleteAction } from "./Alerts";

interface AddMembersToTeamFormProps {
  members: TeamMember[];
  selectedMembers: TeamMember[];
  handleSelectedMembers: (member: TeamMember[]) => void;
  isEditFlow?: boolean;
  teamId: string;
  closeExpand?: () => void;
}

export const AddMembersToTeamForm = observer(function ({
  members = [],
  selectedMembers = [],
  handleSelectedMembers,
  isEditFlow,
  teamId,
  closeExpand,
}: AddMembersToTeamFormProps) {
  const [searchedMembers, setSearchedMembers] = useState<TeamMember[]>(members);

  useEffect(() => {
    setSearchedMembers(members);
  }, [members]);

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
    const isSelected = selectedMembers.some(
      (selected) => selected._id === member._id
    );
    let updatedSelectedMembers;
    if (isSelected) {
      updatedSelectedMembers = selectedMembers.filter(
        (selected) => selected._id !== member._id
      );
    } else {
      updatedSelectedMembers = [...selectedMembers, member];
    }
    handleSelectedMembers(updatedSelectedMembers);
  };

  return (
    <section className="flex flex-col gap-4 h-full">
      <SearchInput placeholder="Search Member" onSearch={handleSearch} />
      <div className="flex flex-col gap-2 flex-grow overflow-y-auto">
        {searchedMembers.map((member) => {
          const isSelected = selectedMembers.some(
            (selected) => selected._id === member._id
          );
          return (
            <div
              key={member._id}
              className={`flex items-center gap-2 justify-between rounded-md border px-2  py-1  transition-all duration-300 hover:bg-hoverBlue ${
                isSelected && "bg-hoverBlue"
              } `}
            >
              <div
                className={`flex gap-2 items-center flex-grow  justify-between cursor-pointer `}
                onClick={() => toggleMemberSelection(member)}
              >
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={isSelected} />
                  <div className="flex gap-2">
                    <p className="text-black font-bold">
                      {member.firstName} {member.lastName}
                    </p>
                    {member.team && (
                      <span className="text-dark-grey">
                        Current Team:{" "}
                        {typeof member.team === "string"
                          ? member.team
                          : member.team?.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {isEditFlow && member.team && (
                <DeleteAction
                  type="memberUnassign"
                  id={member._id}
                  teamId={teamId}
                  onConfirm={() => {
                    handleSelectedMembers(
                      selectedMembers.filter(
                        (selected) => selected._id !== member._id
                      )
                    );
                    closeExpand();
                  }}
                  trigger={
                    <button className="text-error hover:text-dark-error">
                      <TrashIcon />
                    </button>
                  }
                />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
});
