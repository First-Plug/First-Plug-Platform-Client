export const formatAcquisitionDate = (date: string) => {
  if (!date) return "";
  const d = new Date(date);
  return isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
};
