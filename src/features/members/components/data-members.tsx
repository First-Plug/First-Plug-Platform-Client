"use client";

import { type Member, MembersTable } from "@/features/members";

export const DataMembers = ({ members }: { members: Member[] }) => {
  return (
    <div className="h-full max-h-full">
      <MembersTable members={members} />
    </div>
  );
};
