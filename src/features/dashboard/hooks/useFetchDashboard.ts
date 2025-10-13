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

  // Validación defensiva para asegurar que los datos sean arrays
  const safeMembers = Array.isArray(members) ? members : [];
  const safeAssets = Array.isArray(assets) ? assets : [];
  const safeActivityLatest = Array.isArray(activityLatest)
    ? activityLatest
    : [];

  return {
    isLoading:
      isLoadingTeams ||
      isLoadingMembers ||
      isLoadingAssets ||
      isLoadingActivity ||
      isUserLoading ||
      isUserFetching ||
      !updatedUser,
    members: safeMembers,
    assets: safeAssets,
    activityLatest: safeActivityLatest,
    user: updatedUser,
  };
};
