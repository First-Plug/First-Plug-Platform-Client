"use client";
import { types, flow } from "mobx-state-tree";
import { TeamModel, Team } from "@/types";
import { TeamServices } from "@/services/team.services";

export const TeamStore = types
  .model({
    teams: types.array(TeamModel),
  })
  .actions((store) => {
    const setTeams = (teams: Team[]) => {
      store.teams.replace(teams);
    };

    const addTeam = (team: Team) => {
      store.teams.push(team);
    };

    const removeTeam = (teamId: string) => {
      store.teams.replace(store.teams.filter((team) => team._id !== teamId));
    };

    const updateTeam = (updatedTeam: Team) => {
      const index = store.teams.findIndex(
        (team) => team._id === updatedTeam._id
      );
      if (index >= 0) {
        store.teams[index] = updatedTeam;
      }
    };

    const fetchTeams = flow(function* () {
      try {
        const teams = yield TeamServices.getAllTeams();
        setTeams(teams);
      } catch (error) {
        console.error("Failed to fetch teams", error);
      }
    });

    const createTeam = flow(function* (team: { name: string }) {
      try {
        const newTeam = yield TeamServices.createTeam(team);
        addTeam(newTeam);
        return newTeam;
      } catch (error) {
        console.error("Failed to create team", error);
        throw error;
      }
    });

    const getOrCreateTeam = async (teamName: string) => {
      try {
        const teams = await TeamServices.getAllTeams();
        let team = teams.find((team) => team.name === teamName);
        if (!team) {
          team = await TeamServices.createTeam({ name: teamName });
        }
        return team;
      } catch (error) {
        console.error("Error in getOrCreateTeam:", error);
        throw error;
      }
    };

    const deleteTeam = flow(function* (teamId: string) {
      try {
        yield TeamServices.deleteTeam(teamId);
        removeTeam(teamId);
      } catch (error) {
        console.error("Failed to delete team", error);
      }
    });

    const addToTeam = flow(function* (teamId: string, memberId: string) {
      try {
        const updatedTeam = yield TeamServices.addToTeam(teamId, memberId);
        updateTeam(updatedTeam);
      } catch (error) {
        console.error("Failed to add member to team", error);
      }
    });

    const removeFromTeam = flow(function* (teamId: string, memberId: string) {
      try {
        const updatedTeam = yield TeamServices.removeFromTeam(teamId, memberId);
        updateTeam(updatedTeam);
      } catch (error) {
        console.error("Failed to remove member from team", error);
      }
    });

    const bulkDeleteTeams = flow(function* (teamIds: string[]) {
      try {
        yield TeamServices.bulkDeleteTeams(teamIds);
        teamIds.forEach((teamId) => removeTeam(teamId));
      } catch (error) {
        console.error("Failed to bulk delete teams", error);
      }
    });

    return {
      setTeams,
      addTeam,
      removeTeam,
      updateTeam,
      fetchTeams,
      createTeam,
      deleteTeam,
      addToTeam,
      removeFromTeam,
      bulkDeleteTeams,
      getOrCreateTeam,
    };
  });

export const useTeamStore = TeamStore.create({});
