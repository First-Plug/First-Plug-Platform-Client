import { LoaderSpinner } from "@/common";
import { BarLoader } from "@/components/Loader/BarLoader";
import { Skeleton } from "@/components/ui/skeleton";
import { TeamMember } from "@/types";

interface MemberItemProp {
  member: TeamMember;
  deleting: boolean;
  adding: boolean;
  isCurrent: boolean;
  isChanging?: boolean;
  handleSelectMember?: (member: TeamMember) => void;
}
export function MemberItem({
  member,
  isCurrent,
  adding,
  deleting,
  isChanging,
  handleSelectMember,
}: MemberItemProp) {
  const statuses = {
    current: "bg-hoverBlue",
    deleting: "bg-transparent",
    adding: "bg-hoverBlue",
  };
  return (
    <div
      key={member._id}
      className={`flex items-center gap-2 justify-between rounded-md border px-2  py-1  transition-all duration-300 hover:border-blue relative ${
        isCurrent && statuses.current
      } ${adding && statuses.adding} ${deleting && statuses.deleting}`}
    >
      {isChanging && (adding || deleting) && <BarLoader />}
      <div
        className={`flex gap-2 items-center flex-grow  justify-between cursor-pointer `}
        onClick={() => handleSelectMember(member)}
      >
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={(isCurrent && !deleting) || adding}
            className={`${adding && statuses.adding} ${
              deleting && statuses.deleting
            }`}
          />
          <div className="flex items-center py-2 gap-2">
            <p className="text-black font-bold">
              {member.firstName} {member.lastName}
            </p>
            {member.team && (
              <span className="text-dark-grey flex items-center gap-2 ">
                <p>Current Team</p>
                {isChanging && (adding || deleting) ? (
                  <p className="animate-pulse ">...</p>
                ) : typeof member.team === "string" ? (
                  member.team
                ) : (
                  member.team?.name
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
