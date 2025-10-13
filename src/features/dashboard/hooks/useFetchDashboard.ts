import { useActivityLatest } from "@/features/activity";
import { useGetTableAssets } from "@/features/assets";
import { useFetchMembers } from "@/features/members";
import { useFetchTeams } from "@/features/teams";
import { useFetchUser } from "@/features/dashboard";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export const useFetchDashboard = () => {
  const { data: session } = useSession();
  const { isLoading: isLoadingTeams } = useFetchTeams();
  const {
    data: members,
    isLoading: isLoadingMembers,
    refetch: refetchMembers,
  } = useFetchMembers();
  const {
    data: assets,
    isLoading: isLoadingAssets,
    refetch: refetchAssets,
  } = useGetTableAssets();
  const {
    data: activityLatest,
    isLoading: isLoadingActivity,
    refetch: refetchActivity,
  } = useActivityLatest();
  const { user: updatedUser, isUserLoading, isUserFetching } = useFetchUser();

  // Forzar refetch cuando el usuario se autentique
  useEffect(() => {
    if (session?.user) {
      refetchMembers();
      refetchAssets();
      refetchActivity();
    }
  }, [session?.user, refetchMembers, refetchAssets, refetchActivity]);

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
