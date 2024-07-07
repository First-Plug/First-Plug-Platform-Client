import { TeamCard } from "./TeamCard";
import { useStore } from "@/models/root.store";
import FormatedDate from "@/components/Tables/helpers/FormatedDate";
import Avvvatars from "avvvatars-react";
import { Team } from "@/types/teams";

interface MemberDetailProps {
  className?: string;
}

export function MemberDetail({ className }: MemberDetailProps) {
  const {
    members: { selectedMember },
  } = useStore();

  if (!selectedMember) return null;
  const team = selectedMember.team as Team;
  const teamData = team && typeof team === "object" ? team : "Not Assigned";

  return (
    <div className={`flex flex-col gap-4   ${className || ""}`}>
      <div className="flex gap-4 ">
        <div className=" flex justify-center items-center  ">
          <Avvvatars
            value={`${selectedMember.firstName[0]}${selectedMember.lastName[0]}`}
            style={"character"}
            size={150}
          />
        </div>
        <div className="flex flex-col w-full justify-start text-md ">
          <div className="flex w-full justify-between items-center">
            <div className="flex items-center gap-1">
              {selectedMember.team && <TeamCard team={teamData} />}
            </div>
          </div>
          <div className="flex items-center gap-2 ">
            <span className="font-semibold">Job Position: </span>
            <span className="font-normal">{selectedMember.position || ""}</span>
          </div>
          <div className="flex items-center gap-2 ">
            <span className="font-semibold">Joining Date: </span>
            <FormatedDate date={selectedMember.startDate} />
          </div>
          <div className="flex items-center gap-2 ">
            <span className="font-semibold">Birth Date: </span>
            <FormatedDate date={selectedMember.birthDate} />
          </div>
          <div className="flex items-center gap-2 ">
            <span className="font-semibold">Email: </span>
            <span className="font-normal">{selectedMember.email || ""}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
