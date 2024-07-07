"use client";
import React from "react";
import MemberForm from "@/components/AddMember/MemberForm";
import EditMemberAside from "@/components/EditMemberAside";
import { useStore } from "@/models";
import { observer } from "mobx-react-lite";

const AddMemberPage = observer(() => {
  const { aside } = useStore();

  return (
    <div>
      {aside.type === "EditMember" ? <EditMemberAside /> : <MemberForm />}
    </div>
  );
});
export default AddMemberPage;
