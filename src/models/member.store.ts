import { types } from "mobx-state-tree";
import { TeamMemberModel, TeamMember, TeamMemberTable, Team } from "@/types";

export const MemberStore = types
  .model({
    members: types.array(TeamMemberModel),
    memberId: types.optional(types.string, ""),
    selectedMemberEmail: types.optional(types.string, ""),
    teamFilterItems: types.array(types.string),
    memberToEdit: types.maybe(types.string),
    aside: types.optional(types.enumeration(["EditMember", "None"]), "None"),
    relocateChange: types.optional(types.boolean, false),
    fetchingMembers: types.optional(types.boolean, false),
  })
  .views((store) => ({
    get membersTable(): TeamMemberTable[] {
      return store.members.map((member) => ({
        _id: member._id,
        fullName: `${member.firstName} ${member.lastName}`,
        birthDate: member.birthDate || "",
        position: member.position || "",
        startDate: member.startDate || "",
        team: member.team,
        products: member.products,
      }));
    },
    get memberCount() {
      return store.members.length;
    },

    get selectedMember() {
      return store.members.find((member) => member._id === store.memberId);
    },
    get filterMembersByTeam() {
      if (!store.teamFilterItems.length) return store.members;

      return store.members.filter(({ team }) =>
        store.teamFilterItems.some(
          (value) =>
            (typeof team === "string" && team.includes(value)) ||
            (typeof team === "object" && team._id === value)
        )
      );
    },
    get memberFullName() {
      return store.members.map(
        (member) => `${member.firstName} ${member.lastName}`
      );
    },
  }))
  .actions((store) => ({
    setRelocateChange(relocateChange: boolean) {
      store.relocateChange = relocateChange;
    },
    setFetchMembers(fetchValue: boolean) {
      store.fetchingMembers = fetchValue;
    },
    setMembers(members: TeamMember[]) {
      store.members.replace(members);
    },
    setTeams(teams: Team[]) {
      store.members.forEach((member) => {
        if (typeof member.team === "string") {
          const team = teams.find((team) => team._id === member.team);
          if (team) {
            member.team = team;
          }
        }
      });
    },
    setFilter(filterTeams: string[]) {
      store.teamFilterItems.replace(filterTeams);
    },
    addMember(member: TeamMember) {
      store.members.push(member);
    },
    setSelectedMember(memberId: string) {
      store.memberId = memberId;
    },
    setSelectedMemberEmail(memberEmail?: TeamMember["email"]) {
      store.selectedMemberEmail = memberEmail;
    },
    updateMember(member: TeamMember) {
      const index = store.members.findIndex((m) => m._id === member._id);
      if (index !== -1) {
        store.members[index] = member;
      }
    },
    setMemberToEdit(memberId: string) {
      store.memberToEdit = memberId;
    },
    setAside(aside: "EditMember" | "None") {
      store.aside = aside;
    },
    deleteMember(member: TeamMember) {
      const index = store.members.findIndex((m) => m._id === member._id);
      if (index > -1) {
        store.members[index] = member;
      }
    },
  }));
