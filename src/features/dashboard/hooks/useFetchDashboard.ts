import { useActivityLatest } from "@/action-history/hooks/useFetchDashboardActivity";
import { useGetTableAssets } from "@/assets/hooks/useGetTableAssets";
import { useFetchMembers } from "@/members/hooks/useFetchMembers";
import { useFetchTeams } from "@/teams/hooks/useFetchTeams";

export const useFetchDashboard = () => {
  const { isLoading: isLoadingTeams } = useFetchTeams();
  const { data: members, isLoading: isLoadingMembers } = useFetchMembers();
  const { data: assets, isLoading: isLoadingAssets } = useGetTableAssets();
  const { data: activityLatest, isLoading: isLoadingActivity } =
    useActivityLatest();

  return {
    isLoading:
      isLoadingTeams ||
      isLoadingMembers ||
      isLoadingAssets ||
      isLoadingActivity,
    members,
    assets,
    activityLatest,
  };
};
