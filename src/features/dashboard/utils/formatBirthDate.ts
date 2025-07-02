export const formatBirthDate = (dateString: string) => {
  const cleanDate = dateString.includes("T")
    ? dateString.split("T")[0]
    : dateString;
  const [year, month, day] = cleanDate.split("-");
  return `${day}/${month}`;
};
