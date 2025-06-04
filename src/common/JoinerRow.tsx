import Image from "next/image";
import photo from "../../public/employees/Photo-2.png";
import { Team } from "@/types";
import { Member } from "@/features/members";
import { JobPositionColors } from "./StatusColors";

interface joinerProps {
  joiner: Member;
}

export function JoinerRow({ joiner }: joinerProps) {
  const teamName = (joiner.team as Team)?.name || "Not Assigned";
  const backgroundColorClass = JobPositionColors[teamName] || "#d3d3d3";

  return (
    <div className="flex justify-between items-center gap-2 p-2 border-b border-border rounded-md">
      <div className="flex gap-2">
        <Image
          src={photo}
          alt={joiner.lastName}
          className="rounded-md w-[3rem] object-cover"
        />
        <div>
          <h2 className="font-bold text-black">
            {joiner.firstName} {joiner.lastName}
          </h2>
          <div className="flex justify-start gap-2">
            <span className="font-medium text-dark-grey">Joining Date:</span>
            <span className="text-dark-grey">{joiner.startDate}</span>
          </div>
        </div>
      </div>
      <div>
        <span
          className={` ${backgroundColorClass} bg-opacity-70 p-2 text-sm text-gray-800 rounded-md`}
        >
          {teamName}
        </span>
      </div>
    </div>
  );
}
