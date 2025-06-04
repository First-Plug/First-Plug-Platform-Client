"use client";
import { observer } from "mobx-react-lite";
import { useStore } from "@/models";

import { PageLoader } from "@/shared";
import { MemberForm, useFetchMember } from "@/features/members";

export const EditMemberAside = observer(() => {
  const {
    members: { memberToEdit },
  } = useStore();

  const { data: member, isLoading } = useFetchMember(memberToEdit);

  if (isLoading) {
    return <PageLoader />;
  }

  return <MemberForm initialData={member} isUpdate={true} />;
});
