interface InventoryStatusLegendProps {
  assigned: number;
  available: number;
  unavailable: number;
  inTransit: number;
  inTransitMissingData: number;
  assignedColor?: string;
  availableColor?: string;
  unavailableColor?: string;
  inTransitColor?: string;
  inTransitMissingDataColor?: string;
}

export function InventoryStatusLegend({
  assigned,
  available,
  unavailable,
  inTransit,
  inTransitMissingData,
  assignedColor,
  availableColor,
  unavailableColor,
  inTransitColor,
  inTransitMissingDataColor,
}: InventoryStatusLegendProps) {
  const statuses = [
    { label: "Assigned", value: assigned, color: assignedColor },
    { label: "Available", value: available, color: availableColor },
    { label: "Unavailable", value: unavailable, color: unavailableColor },
    { label: "In Transit", value: inTransit, color: inTransitColor },
    {
      label: "I. T. Missing Data",
      shortLabel: "Missing Data",
      value: inTransitMissingData,
      color: inTransitMissingDataColor,
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-5  mt-6 w-[60%] ">
      <div className="space-y-3 w-full">
        {statuses.map((status) => (
          <div
            key={status.label}
            className="flex items-center justify-between gap-2 pr-16"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="h-5 w-5 flex-shrink-0 rounded-sm"
                style={{ backgroundColor: status.color }}
              />
              <span className="text-md font-semibold truncate overflow-hidden text-ellipsis whitespace-nowrap">
                {status.label}
              </span>
            </div>
            <span className="font-semibold text-md flex-shrink-0 ">
              {status.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
