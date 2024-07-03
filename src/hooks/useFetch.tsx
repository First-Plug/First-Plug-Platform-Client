import { useStore } from "@/models";
import { Memberservices, ProductServices, TeamServices } from "@/services";
import { transformData } from "@/utils/dataTransformUtil";

export default function useFetch() {
  const {
    members: { setMembers, setFetchMembers },
    products: { setTable, setFetchStock },
    teams: { setTeams },
  } = useStore();

  const fetchMembers = async () => {
    setFetchMembers(true);
    try {
      const membersResponse = await Memberservices.getAllMembers();
      await fetchTeams();
      const teamsResponse = await TeamServices.getAllTeams();
      console.log("Fetched teams response:", teamsResponse);
      setTeams(teamsResponse);
      const transformedMembers = transformData(membersResponse, teamsResponse);
      setMembers(transformedMembers);

      return transformedMembers;
    } catch (error) {
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
    } catch (error) {}
  };
  return { fetchMembers, fetchStock, fetchTeams };
}
