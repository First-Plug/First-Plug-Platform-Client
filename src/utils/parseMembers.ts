import { CreateMemberZodModel, CsvMember } from "@/types";
function convertToISODate(inputDate: string): string {
  // Dividir la cadena de entrada en componentes de día, mes y año
  const [day, month, year] = inputDate.split("/");

  // Reordenar los componentes en el formato YYYY-MM-DD
  const formattedDate = `${year}-${month}-${day}`;

  // Crear una nueva instancia de Date usando la cadena reordenada
  const date = new Date(formattedDate);

  // Verificar si la fecha es válida
  if (isNaN(date.getTime())) {
    throw new Error("Invalid date format");
  }

  // Convertir la fecha a una cadena en formato ISO
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
