import { useQueryClient } from "@tanstack/react-query";
import { PenIcon } from "@/shared";
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

  return (
    <button disabled={isDisabled} onClick={handleEditShipment}>
      <PenIcon
        strokeWidth={2}
        className={`mr-1 w-[1.2rem] h-[1.2rem] ${
          isDisabled ? "text-disabled" : "text-blue hover:text-blue/70"
        }`}
      />
    </button>
  );
};
