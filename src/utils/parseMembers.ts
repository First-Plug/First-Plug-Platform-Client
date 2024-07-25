import { CreateMemberZodModel, CsvMember } from "@/types";
function convertToISODate(inputDate: string): string {
  const [month, day, year] = inputDate.split("/");
  const formattedDate = `${year}-${month}-${day}`;
  const date = new Date(formattedDate);
  if (isNaN(date.getTime())) {
    throw new Error("Invalid date format");
  }
  return date.toISOString();
}

export function parseMembers(member: CsvMember): CreateMemberZodModel {
  const obj = {
    firstName: member["First Name *"],
    lastName: member["Last Name *"],
    email: member["Email *"],
    startDate:
      member["Start Date"] !== ""
        ? convertToISODate(member["Start Date"])
        : member["Start Date"],
    birthDate:
      member["Birth Date"] !== ""
        ? convertToISODate(member["Birth Date"])
        : member["Birth Date"],
    team: member.Team,
    personalEmail: member["Personal Email"],
    phone: member.Phone,
    additionalInfo: member["Additional Info"],
    address: member.Address,
    apartment: member.Apartment,
    city: member.City,
    country: member.Country,
    zipCode: member["Zip Code"],
    position: member["Job Position"],
  };

  const filteredObj = Object.fromEntries(
    Object.entries(obj).filter(([key, value]) => value)
  );

  return filteredObj;
}
