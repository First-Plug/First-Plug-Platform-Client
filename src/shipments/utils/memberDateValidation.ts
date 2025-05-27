import { TeamMember } from "@/types";
import { isAfter, isSameDay, parseISO, isValid } from "date-fns";

export const checkMemberJoinDate = (
  destinationMember: TeamMember | null
): { shouldShowWarning: boolean; joinDate: Date | null } => {
  console.log("Checking member join date for:", destinationMember);

  // Si no hay miembro o no tiene startDate, retornar false
  if (!destinationMember) {
    console.log("No destination member provided");
    return { shouldShowWarning: false, joinDate: null };
  }

  // Verificar si el miembro tiene startDate
  if (!destinationMember.startDate) {
    console.log("Member has no startDate:", destinationMember);
    return { shouldShowWarning: false, joinDate: null };
  }

  // Intentar parsear la fecha
  let joinDate: Date;
  try {
    joinDate = parseISO(destinationMember.startDate);

    // Verificar si la fecha es válida
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

  // Verificar si la fecha de incorporación es igual o posterior a la fecha actual
  const isJoinDateFutureOrToday =
    isAfter(joinDate, currentDate) || isSameDay(joinDate, currentDate);

  console.log("Is join date future or today:", isJoinDateFutureOrToday);

  return {
    shouldShowWarning: isJoinDateFutureOrToday,
    joinDate: isJoinDateFutureOrToday ? joinDate : null,
  };
};
