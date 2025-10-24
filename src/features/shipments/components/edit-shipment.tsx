import { useQueryClient } from "@tanstack/react-query";
import {
  PenIcon,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared";
import { Shipment } from "../interfaces/shipments-response.interface";
import { useAsideStore } from "@/shared";

interface Props {
  shipment: Shipment;
  isDisabled: boolean;
}

export const EditShipment = ({ isDisabled, shipment }: Props) => {
  const { setAside } = useAsideStore();

  const queryClient = useQueryClient();

  const handleEditShipment = () => {
    queryClient.setQueryData(["shipment"], shipment);
    setAside("UpdateShipment");
  };

  const getTooltipMessage = () => {
    if (shipment.shipment_status === "On The Way") {
      return 'Shipments that are "On the way" cannot be edited.';
    }
    if (
      shipment.shipment_status === "Received" ||
      shipment.shipment_status === "Cancelled"
    ) {
      return "Canceled or received shipments cannot be edited.";
    }
    return "";
  };

  const tooltipMessage = getTooltipMessage();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <button disabled={isDisabled} onClick={handleEditShipment}>
              <PenIcon
                strokeWidth={2}
                className={`mr-1 w-[1.2rem] h-[1.2rem] mt-1 ${
                  isDisabled ? "text-disabled" : "text-blue hover:text-blue/70"
                }`}
              />
            </button>
          </div>
        </TooltipTrigger>
        {isDisabled && tooltipMessage && (
          <TooltipContent className="bg-white">
            <p>{tooltipMessage}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};
