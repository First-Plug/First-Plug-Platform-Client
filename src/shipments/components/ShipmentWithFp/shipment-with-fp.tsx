import { useState, useEffect } from "react";
import { Dropdown } from "../index";
import { DialogShipmentWithFp } from "./dialog-shipment-with-fp";
import { useForm, Controller } from "react-hook-form"; // Importamos react-hook-form
import { AsapOrDateValue } from "./asap-or-date";

interface Props {
  onSubmit: (data: any) => void;
}

export const ShipmentWithFp = ({ onSubmit }: Props) => {
  const { setValue, watch } = useForm();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pickupDate, setPickupDate] = useState<AsapOrDateValue>("");
  const [deliveredDate, setDeliveredDate] = useState<AsapOrDateValue>("");

  // Obtener el valor del dropdown
  const shipmentValue = watch("shipment");

  // Verificar si ambas fechas son válidas
  const isPickupAndDeliveredValid = pickupDate !== "" && deliveredDate !== "";

  const handleDropdownChange = (value: string) => {
    // Si el valor del dropdown es 'yes', abrir el diálogo
    if (value === "yes") {
      setIsDialogOpen(true);
    } else {
      setIsDialogOpen(false);
      // Resetear las fechas cuando se selecciona "no"
      setPickupDate("");
      setDeliveredDate("");
      onSubmit({ shipment: "no" }); // Realiza el submit cuando el valor es "no"
    }
    setValue("shipment", value);
  };

  const handleDialogSave = () => {
    // Actualiza el valor del dropdown después de guardar
    setValue("shipment", "yes");
    setIsDialogOpen(false); // Cierra el diálogo después de guardar
    onSubmit({ shipment: "yes", pickupDate, deliveredDate }); // Realiza el submit cuando es "yes" y las fechas están completas
  };

  const handleDialogCancel = () => {
    // Limpiar las fechas y el valor del dropdown cuando se cancela
    setPickupDate("");
    setDeliveredDate("");
    setValue("shipment", ""); // Limpiar el valor del dropdown
    onSubmit(null);
  };

  const getDropdownColor = () => {
    if (shipmentValue === "yes" && !isPickupAndDeliveredValid) {
      return "error"; // Error si "yes" pero las fechas no están completas
    }
    if (shipmentValue === "yes" && isPickupAndDeliveredValid) {
      return "success"; // Success si "yes" y las fechas están completas
    }

    if (shipmentValue === "no") {
      return "success";
    }

    return "grey";
  };

  return (
    <>
      <form className="py-4">
        <Dropdown
          value={shipmentValue || ""}
          onChange={handleDropdownChange}
          color={getDropdownColor()}
          errorMessage={
            shipmentValue === "yes" && !isPickupAndDeliveredValid
              ? "Please select both dates"
              : ""
          }
          className="w-full max-w-md"
        >
          <Dropdown.Label>Ship with FP?</Dropdown.Label>
          <Dropdown.Trigger
            className="flex mt-2"
            placeholder="Select an option"
          >
            <DialogShipmentWithFp
              isOpen={isDialogOpen}
              onOpenChange={setIsDialogOpen}
              pickupDate={pickupDate}
              onPickupDateChange={setPickupDate}
              deliveredDate={deliveredDate}
              onDeliveredDateChange={setDeliveredDate}
              onSave={handleDialogSave}
              onCancel={handleDialogCancel}
            />
          </Dropdown.Trigger>
          <Dropdown.Options>
            <Dropdown.Option value="yes">Yes</Dropdown.Option>
            <Dropdown.Option value="no">No</Dropdown.Option>
          </Dropdown.Options>
          <Dropdown.ErrorMessage />
        </Dropdown>
      </form>
    </>
  );
};
