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
      if (error.response.data.message === "Unauthorized") {
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
      console.log("Error fetching stock:", error);
    } finally {
      setFetchStock(false);
    }
  };

  const fetchTeams = async () => {
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
  return { fetchMembers, fetchStock, fetchTeams };
}
