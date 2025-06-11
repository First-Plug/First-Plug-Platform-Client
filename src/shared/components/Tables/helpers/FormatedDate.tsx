export default function FormatedDate({ date }: { date: string }) {
  const dateFormat = date ? new Date(date) : null;
  return (
    <span className="text-md font-normal">
      {dateFormat
        ? dateFormat.toLocaleDateString("es-AR", { timeZone: "UTC" })
        : "-"}
    </span>
  );
}
