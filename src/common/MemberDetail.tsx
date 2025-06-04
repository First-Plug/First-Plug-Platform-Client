import { TeamCard } from "./TeamCard";
import { useStore } from "@/models/root.store";
import FormatedDate from "@/components/Tables/helpers/FormatedDate";
import Avvvatars from "avvvatars-react";
import { Team } from "@/types/teams";
import { useFetchMember } from "@/features/members";
import { Loader } from "lucide-react";

interface MemberDetailProps {
  memberId: string;
  className?: string;
}

export function MemberDetail({ memberId, className }: MemberDetailProps) {
  // const {
  //   members: { selectedMember },
  // } = useStore();

  const { data: member, isLoading, isError } = useFetchMember(memberId);

  if (isLoading) return <Loader />;
  if (isError || !member) return <div>Error loading member details...</div>;

  const team = member.team as Team;
  const teamData = team && typeof team === "object" ? team : "Not Assigned";

  return (
    <div className={`flex flex-col gap-4   ${className || ""}`}>
      <div className="flex gap-4">
        <div className="flex justify-center items-center">
          <Avvvatars
            value={`${member.firstName[0]}${member.lastName[0]}`}
            style={"character"}
            size={150}
          />
        </div>
        <div className="flex flex-col justify-start w-full text-md">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-1">
              {member.team && <TeamCard team={teamData} />}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Job Position: </span>
            <span className="font-normal">{member.position || ""}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Joining Date: </span>
            <FormatedDate date={member.startDate} />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Birth Date: </span>
            <FormatedDate date={member.birthDate} />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Email: </span>
            <span className="font-normal">{member.email || ""}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Active Shipment: </span>
            <span className="font-normal">
              {member.activeShipment ? "Yes" : "No"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
