import { Team } from "@/types";
import { Member } from "@/features/members";

export const transformData = (
  members: Member[] = [],
  teams: Team[] = []
): Member[] => {
  const teamMap = teams.reduce((acc, team) => {
    acc[team._id] = team;
    return acc;
  }, {} as Record<string, Team>);

  return members.map((member) => ({
    ...member,
    birthDate: member.birthDate || null,
    team:
      member.team && typeof member.team === "string"
        ? teamMap[member.team]
        : member.team,
  }));
};
