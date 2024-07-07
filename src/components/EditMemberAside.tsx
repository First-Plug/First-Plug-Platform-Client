"use client";
import React from "react";
import { observer } from "mobx-react-lite";
import { Loader } from "../components/Loader/Loader";
import MemberForm from "../components/AddMember/MemberForm";
import useLoadMemberData from "./AddMember/useLoadMemberData";

const EditMemberAside = observer(() => {
  const initialData = useLoadMemberData();

  return initialData ? (
    <div>
      <MemberForm initialData={initialData} isUpdate={true} />
    </div>
  ) : (
    <Loader />
  );
});

export default EditMemberAside;
