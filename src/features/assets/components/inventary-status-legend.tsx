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

export const InventoryStatusLegend = ({
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
}: InventoryStatusLegendProps) => {
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
    <div className="bg-white shadow-sm mt-6 p-5 rounded-lg w-[60%]">
      <div className="space-y-3 w-full">
        {statuses.map((status) => (
          <div
            key={status.label}
            className="flex justify-between items-center gap-2 pr-16"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="flex-shrink-0 rounded-sm w-5 h-5"
                style={{ backgroundColor: status.color }}
              />
              <span className="overflow-hidden font-semibold text-md truncate text-ellipsis whitespace-nowrap">
                {status.label}
              </span>
            </div>
            <span className="flex-shrink-0 font-semibold text-md">
              {status.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
