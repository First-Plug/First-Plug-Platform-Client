import { useState } from "react";

interface ShipmentWithFpData {
  shipment: string;
  pickupDate?: string;
  deliveredDate?: string;
}

export const useShipmentValues = () => {
  const [shipmentValue, setShipmentValue] = useState<ShipmentWithFpData>(null);

  const onSubmitDropdown = (data: ShipmentWithFpData) => {
    setShipmentValue(data);
  };

  const isShipmentValueValid = () => {
    return (
      shipmentValue ||
      (shipmentValue &&
        (shipmentValue.shipment === "yes" || shipmentValue.shipment === "no"))
    );
  };

  return {
    shipmentValue,
    onSubmitDropdown,
    isShipmentValueValid,
  };
};
