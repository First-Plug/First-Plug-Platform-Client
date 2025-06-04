"use client";

import { useEffect, useState } from "react";
import { Memberservices } from "@/services";
import { Member } from "@/features/members";

import { useStore } from "@/models";

export const useLoadMemberData = () => {
  const { members } = useStore();
  const [initialData, setInitialData] = useState<Member | null>(null);

  useEffect(() => {
    if (members.memberToEdit) {
      Memberservices.getOneMember(members.memberToEdit).then((data) => {
        setInitialData(data);
      });
    } else {
      setInitialData(null);
    }
  }, [members.memberToEdit]);

  return initialData;
};
