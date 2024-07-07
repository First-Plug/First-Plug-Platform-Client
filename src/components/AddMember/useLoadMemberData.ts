import { useEffect, useState } from "react";
import { Memberservices } from "@/services";
import { TeamMember } from "@/types";
import { useStore } from "@/models";

const useLoadMemberData = () => {
  const { members } = useStore();
  const [initialData, setInitialData] = useState<TeamMember | null>(null);

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

export default useLoadMemberData;
