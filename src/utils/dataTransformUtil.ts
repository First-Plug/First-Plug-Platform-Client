import { Team, TeamMember } from "@/types";

export const transformData = (
  members: TeamMember[],
  teams: Team[]
): TeamMember[] => {
  const teamMap = teams.reduce((acc, team) => {
    acc[team._id] = team;
    return acc;
  }, {} as Record<string, Team>);

  return members.map((member) => ({
    ...member,
    team:
      member.team && typeof member.team === "object" && member.team._id
        ? teamMap[member.team._id]
        : member.team,
  }));
};
