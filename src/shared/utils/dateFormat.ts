export function dateTo_DDMMYY(date: string): string {
  const fecha = new Date(date);
  const dia = fecha.getDate().toString().padStart(2, "0");
  const mes = (fecha.getMonth() + 1).toString().padStart(2, "0"); // Los meses van de 0 a 11
  const año = fecha.getFullYear();

  return `${dia}/${mes}/${año}`;
}

export function formatDate(date: string): string {
  const fecha = new Date(date);
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return fecha.toLocaleDateString("en-US", options);
}
