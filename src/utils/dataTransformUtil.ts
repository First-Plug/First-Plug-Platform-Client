import { Team, TeamMember } from "@/types";

export const transformData = (
  members: TeamMember[] = [],
  teams: Team[] = []
): TeamMember[] => {
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
