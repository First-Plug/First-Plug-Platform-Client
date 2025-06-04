import { Member } from "@/features/members";

import { isAfter, isSameDay, parseISO, isValid } from "date-fns";

export const checkMemberJoinDate = (
  destinationMember: Member | null
): { shouldShowWarning: boolean; joinDate: Date | null } => {
  console.log("Checking member join date for:", destinationMember);

  if (!destinationMember) {
    console.log("No destination member provided");
    return { shouldShowWarning: false, joinDate: null };
  }

  if (!destinationMember.startDate) {
    console.log("Member has no startDate:", destinationMember);
    return { shouldShowWarning: false, joinDate: null };
  }

  let joinDate: Date;
  try {
    joinDate = parseISO(destinationMember.startDate);

    if (!isValid(joinDate)) {
      console.log("Invalid date format:", destinationMember.startDate);
      return { shouldShowWarning: false, joinDate: null };
    }
  } catch (error) {
    console.error("Error parsing date:", error);
    return { shouldShowWarning: false, joinDate: null };
  }

  const currentDate = new Date();

  console.log("Member startDate:", destinationMember.startDate);
  console.log("Parsed joinDate:", joinDate);
  console.log("Current date:", currentDate);

  const isJoinDateFutureOrToday =
    isAfter(joinDate, currentDate) || isSameDay(joinDate, currentDate);

  console.log("Is join date future or today:", isJoinDateFutureOrToday);

  return {
    shouldShowWarning: isJoinDateFutureOrToday,
    joinDate: isJoinDateFutureOrToday ? joinDate : null,
  };
};
