"use client";
import { useState, useEffect } from "react";
import { DialogShipmentWithFp } from "./dialog-shipment-with-fp";
import { useForm, Controller } from "react-hook-form";
import { AsapOrDateValue } from "./asap-or-date";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared";
import { InfoCircle } from "@/shared";
import { TooltipArrow } from "@radix-ui/react-tooltip";
import {
  Select,
  SelectOption,
  SelectOptions,
  SelectTrigger,
  SelectLabel,
} from "@/features/shipments";
import { Member } from "@/features/members";

interface Props {
  onSubmit: (data: any) => void;
  destinationMember?: Member | null;
}

export const ShipmentWithFp = ({ onSubmit, destinationMember }: Props) => {
  const { setValue, watch } = useForm();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pickupDate, setPickupDate] = useState<AsapOrDateValue>("");
  const [deliveredDate, setDeliveredDate] = useState<AsapOrDateValue>("");

  // Obtener el valor del dropdown
  const shipmentValue = watch("shipment");

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

  return (
    <>
      <form>
        <Select
          value={shipmentValue || ""}
          onChange={handleDropdownChange}
          color={"grey"}
          className="w-full max-w-md"
        >
          <SelectLabel className="flex items-center gap-2">
            <span className="font-semibold text-dark-grey">Ship with FP?</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" className="text-blue/80">
                    <InfoCircle />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  align="center"
                  className="z-50 bg-blue/80 p-2 rounded-md font-normal text-white text-xs"
                >
                  Select &apos;Yes&apos; to let First Plug handle the shipment.
                  Pickup and delivery dates will be required.
                  <TooltipArrow className="fill-blue/80" />
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </SelectLabel>
          <SelectTrigger
            className="flex mt-2"
            placeholder="Select an option"
            icon={
              <DialogShipmentWithFp
                isOpen={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                pickupDate={pickupDate}
                onPickupDateChange={setPickupDate}
                deliveredDate={deliveredDate}
                onDeliveredDateChange={setDeliveredDate}
                onSave={handleDialogSave}
                onCancel={handleDialogCancel}
                destinationMember={destinationMember}
              />
            }
          />
          <SelectOptions>
            <SelectOption value="yes">Yes</SelectOption>
            <SelectOption value="no">No</SelectOption>
          </SelectOptions>
        </Select>
      </form>
    </>
  );
};
