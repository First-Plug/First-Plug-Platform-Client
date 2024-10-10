"use client";
import { MembersTable } from "@/components/Tables";
import { TeamMember } from "@/types";

const DataTeam = ({ members }: { members: TeamMember[] }) => {
  return (
    <div className="h-full max-h-full">
      <MembersTable members={members} />
    </div>
  );
};

export default DataTeam;
