import { useQueryClient } from "@tanstack/react-query";
import { useStore } from "@/models";
import { PenIcon } from "@/common";
import { Shipment } from "../interfaces/shipments-response.interface";

interface Props {
  shipment: Shipment;
  isDisabled: boolean;
}

export const EditShipment = ({ isDisabled, shipment }: Props) => {
  const {
    aside: { setAside },
  } = useStore();

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
          isDisabled ? "text-dark-grey" : "text-blue hover:text-blue/70"
        }`}
      />
    </button>
  );
};
