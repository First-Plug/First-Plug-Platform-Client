import { useActivityLatest } from "@/features/activity";
import { useGetTableAssets } from "@/features/assets";
import { useFetchMembers } from "@/features/members";
import { useFetchTeams } from "@/features/teams";
import { useFetchUser } from "@/features/dashboard";

export const useFetchDashboard = () => {
  const { isLoading: isLoadingTeams } = useFetchTeams();
  const { data: members, isLoading: isLoadingMembers } = useFetchMembers();
  const { data: assets, isLoading: isLoadingAssets } = useGetTableAssets();
  const { data: activityLatest, isLoading: isLoadingActivity } =
    useActivityLatest();
  const { user: updatedUser, isUserLoading, isUserFetching } = useFetchUser();

  return {
    isLoading:
      isLoadingTeams ||
      isLoadingMembers ||
      isLoadingAssets ||
      isLoadingActivity ||
      isUserLoading ||
      isUserFetching ||
      !updatedUser,
    members,
    assets,
    activityLatest,
    user: updatedUser,
  };
};
