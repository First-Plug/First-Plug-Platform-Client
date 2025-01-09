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
    offBoardingFullName: types.optional(types.string, ""),
  })
  .views((store) => ({
    get membersTable(): TeamMemberTable[] {
      return store.members.map((member) => {
        let teamName: string;
        if (typeof member.team === "string") {
          teamName = member.team;
        } else if (member.team && member.team.name) {
          teamName = member.team.name;
        } else {
          teamName = "Not Assigned";
        }

        return {
          _id: member._id,
          fullName: `${member.firstName} ${member.lastName}`,
          birthDate: member.birthDate || "",
          position: member.position || "",
          startDate: member.startDate || "",
          team: teamName,
          products: member.products,
        };
      });
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
      if (!members || !Array.isArray(members)) {
        console.error("members is undefined or not an array");
        return;
      }
      const membersG = members.map((member) => ({
        ...member,
        personalEmail: member.personalEmail ?? null,
        //@ts-ignore
        team: member.team ?? "Not Assigned",
      }));
      store.members.replace(membersG);
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
    setMemberOffBoarding(fullName: string) {
      store.offBoardingFullName = fullName;
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
    updateMember(member) {
      const index = store.members.findIndex((m) => m._id === member._id);

      if (index !== -1) {
        console.log("Actualizando miembro en el store:", member);
        store.members[index] = member;
        store.members.splice(index, 1, member);
      } else {
        console.error(
          "No se encontró el miembro a actualizar en el estado:",
          member._id
        );
      }
    },
    setMemberToEdit(memberId: string) {
      store.memberToEdit = memberId;
    },
    setAside(aside: "EditMember" | "None") {
      store.aside = aside;
    },
    deleteMember(memberId: string) {
      const index = store.members.findIndex((m) => m._id === memberId);
      if (index > -1) {
        store.members.splice(index, 1);
      }
    },
  }));
