"use client";
import { MemberForm, EditMemberAside } from "@/features/members";
import { useStore } from "@/models";
import { observer } from "mobx-react-lite";

export default observer(function AddMemberPage() {
  const { aside } = useStore();

  return (
    <>{aside.type === "EditMember" ? <EditMemberAside /> : <MemberForm />}</>
  );
});
