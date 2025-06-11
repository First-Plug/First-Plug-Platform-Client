"use client";

import { MemberForm, useMemberStore } from "@/features/members";

export const EditMemberAside = () => {
  const { selectedMember } = useMemberStore();

  return <MemberForm initialData={selectedMember} isUpdate={true} />;
};
