"use client";
import { MembersTable } from "@/components/Tables";
import { useFetchMembers } from "@/members/hooks";
import { TeamMember } from "@/types";

const DataTeam = () => {
  const { data: members = [], isLoading, isError } = useFetchMembers();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error loading members...</div>;
  }

  const plainMembers: TeamMember[] = members;

  return (
    <div className="h-full max-h-full">
      <MembersTable members={plainMembers} />
    </div>
  );
};

export default DataTeam;
