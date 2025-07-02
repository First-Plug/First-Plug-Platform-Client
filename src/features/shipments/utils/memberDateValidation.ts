import { Member } from "@/features/members";

import { isAfter, isSameDay, parseISO, isValid } from "date-fns";

export const checkMemberJoinDate = (
  destinationMember: Member | null
): { shouldShowWarning: boolean; joinDate: Date | null } => {
  if (!destinationMember) {
    return { shouldShowWarning: false, joinDate: null };
  }

  if (!destinationMember.startDate) {
    return { shouldShowWarning: false, joinDate: null };
  }

  let joinDate: Date;
  try {
    joinDate = parseISO(destinationMember.startDate);

    if (!isValid(joinDate)) {
      return { shouldShowWarning: false, joinDate: null };
    }
  } catch (error) {
    console.error("Error parsing date:", error);
    return { shouldShowWarning: false, joinDate: null };
  }

  const currentDate = new Date();

  const isJoinDateFutureOrToday =
    isAfter(joinDate, currentDate) || isSameDay(joinDate, currentDate);

  return {
    shouldShowWarning: isJoinDateFutureOrToday,
    joinDate: isJoinDateFutureOrToday ? joinDate : null,
  };
};
