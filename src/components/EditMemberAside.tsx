"use client";
import React from "react";
import { observer } from "mobx-react-lite";
import { Loader } from "../components/Loader/Loader";
import MemberForm from "../components/AddMember/MemberForm";
import { useStore } from "@/models";
import { useFetchMember } from "@/members/hooks";

const EditMemberAside = observer(() => {
  const {
    members: { memberToEdit },
  } = useStore();
  const { data: member, isLoading } = useFetchMember(memberToEdit);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div>
      <MemberForm initialData={member} isUpdate={true} />
    </div>
  );
});

export default EditMemberAside;
