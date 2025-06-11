function DMY_Date(dateISO: string): string {
  const date = new Date(dateISO);

  return date.toLocaleDateString("en");
}
function getMonth(index: number) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return months[index];
}
export { DMY_Date, getMonth };
