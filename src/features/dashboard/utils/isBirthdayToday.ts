export const isBirthdayToday = (birthday: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayUTC = Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const cleanDate = birthday.includes("T") ? birthday.split("T")[0] : birthday;

  if (!cleanDate || typeof cleanDate !== "string" || !cleanDate.includes("-")) {
    console.error(`Invalid birth date format: ${cleanDate}`);
    return false;
  }
  const [year, month, day] = cleanDate.split("-").map(Number);

  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    console.error(`Failed to parse birth date: ${cleanDate}`);
    return false;
  }
  const birthdayUTC = Date.UTC(today.getFullYear(), month - 1, day);

  return todayUTC === birthdayUTC;
};
