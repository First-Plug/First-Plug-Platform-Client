import Image from "next/image";
import photo from "../../public/employees/Photo-2.png";
import { Team, TeamMember } from "@/types";
import { JobPositionColors } from "./StatusColors";

interface joinerProps {
  joiner: TeamMember;
}

export function JoinerRow({ joiner }: joinerProps) {
  const teamName = (joiner.team as Team)?.name || "Not Assigned";
  const backgroundColorClass = JobPositionColors[teamName] || "#d3d3d3";

  return (
    <div className=" flex items-center gap-2 justify-between p-2 border-b rounded-md border-border   ">
      <div className="flex gap-2 ">
        <Image
          src={photo}
          alt={joiner.lastName}
          className="w-[3rem] object-cover rounded-md"
        />
        <div>
          <h2 className="text-black font-bold">
            {joiner.firstName} {joiner.lastName}
          </h2>
          <div className="flex gap-2 justify-start">
            <span className="font-medium text-dark-grey">Joining Date:</span>
            <span className=" text-dark-grey">{joiner.startDate}</span>
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
