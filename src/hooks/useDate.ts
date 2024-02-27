import { format, parseISO } from "date-fns";

export function useDate() {
  function DMY_Date(dateISO: string): string {
    // const date = parseISO(dateString);
    // return format(date, "dd/MM/yyyy");
    const date = new Date(dateISO);

    // Get date components
    const day = date.getUTCDate();
    const month = date.getUTCMonth() + 1; // Adding 1 because months are zero-indexed
    const year = date.getUTCFullYear();

    // Add leading zeros if necessary
    const day2 = day < 10 ? "0" + day : day;
    const month2 = month < 10 ? "0" + month : month;

    // Format the date as DD/MM/YYYY
    return day2 + "/" + month2 + "/" + year;
  }

  return { DMY_Date };
}
