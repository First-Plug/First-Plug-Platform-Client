import { useStore } from "@/models";
import { Memberservices, ProductServices, TeamServices } from "@/services";
import { transformData } from "@/utils/dataTransformUtil";
import { signOut } from "next-auth/react";
export default function useFetch() {
  const {
    members: { setMembers, setFetchMembers },
    products: { setTable, setFetchStock },
    teams: { setTeams },
  } = useStore();

  const fetchMembersAndTeams = async (skipLoader?: boolean) => {
    if (!skipLoader) {
      setFetchMembers(true);
    }
    const cachedMembers = localStorage.getItem("members");
    const cachedTeams = localStorage.getItem("teams");

    if (cachedMembers && cachedTeams) {
      setMembers(JSON.parse(cachedMembers));
      setTeams(JSON.parse(cachedTeams));
    }

    try {
      const [membersResponse, teamsResponse] = await Promise.all([
        Memberservices.getAllMembers(),
        TeamServices.getAllTeams(),
      ]);

      const cachedMembersParsed = JSON.parse(cachedMembers || "[]");
      const cachedTeamsParsed = JSON.parse(cachedTeams || "[]");

      const membersChanged =
        JSON.stringify(cachedMembersParsed) !== JSON.stringify(membersResponse);
      const teamsChanged =
        JSON.stringify(cachedTeamsParsed) !== JSON.stringify(teamsResponse);

      if (membersChanged || teamsChanged) {
        localStorage.setItem("members", JSON.stringify(membersResponse));
        localStorage.setItem("teams", JSON.stringify(teamsResponse));

        const transformedMembers = transformData(
          membersResponse,
          teamsResponse
        );
        setMembers(transformedMembers);
        setTeams(teamsResponse);
      }
    } catch (error) {
      if (error.response?.data?.message === "Unauthorized") {
        sessionStorage.clear();
        localStorage.removeItem("token");
        signOut({ callbackUrl: "http://localhost:3000/login" });
      }
      console.error("Error fetching members and teams:", error);
    } finally {
      setFetchMembers(false);
    }
  };

  const fetchMembers = async (skipLoader?: boolean) => {
    if (!skipLoader) {
      setFetchMembers(true);
    }
    try {
      const membersResponse = await Memberservices.getAllMembers();
      const teamsResponse = await TeamServices.getAllTeams();
      setTeams(teamsResponse);
      const transformedMembers = transformData(membersResponse, teamsResponse);
      setMembers(transformedMembers);

      return transformedMembers;
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message === "Unauthorized"
      ) {
        sessionStorage.clear();
        localStorage.removeItem("token");
        signOut({ callbackUrl: "http://localhost:3000/login" });
      }
      console.error("Error fetching members:", error);
    } finally {
      setFetchMembers(false);
    }
  };

  const fetchStock = async () => {
    setFetchStock(true);
    try {
      const response = await ProductServices.getTableFormat();
      setTable(response);

      return response;
    } catch (error) {
      if (error.response.data.message === "Unauthorized") {
        sessionStorage.clear();
        localStorage.removeItem("token");
        signOut({ callbackUrl: "http://localhost:3000/login" });
      }
      console.error("Error fetching stock:", error);
    } finally {
      setFetchStock(false);
    }
  };

  const fetchTeams = async () => {
    const cachedTeams = sessionStorage.getItem("teams");
    if (cachedTeams) {
      setTeams(JSON.parse(cachedTeams));
      return JSON.parse(cachedTeams);
    }
    try {
      const response = await TeamServices.getAllTeams();
      setTeams(response);
      return response;
    } catch (error) {
      if (error.response.data.message === "Unauthorized") {
        sessionStorage.clear();
        localStorage.removeItem("token");
        signOut({ callbackUrl: "http://localhost:3000/login" });
      }
    }
  };
  return { fetchMembers, fetchStock, fetchTeams, fetchMembersAndTeams };
}
