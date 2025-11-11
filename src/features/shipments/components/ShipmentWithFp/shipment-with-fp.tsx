"use client";
import { useState } from "react";
import { DialogShipmentWithFp } from "./dialog-shipment-with-fp";
import { useForm } from "react-hook-form";
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

  const shipmentValue = watch("shipment");

  const handleDropdownChange = (value: string) => {
    if (value === "yes") {
      setIsDialogOpen(true);
    } else {
      setIsDialogOpen(false);
      setPickupDate("");
      setDeliveredDate("");
      onSubmit({ shipment: "no" });
    }
    setValue("shipment", value);
  };

  const handleDialogSave = () => {
    setValue("shipment", "yes");
    setIsDialogOpen(false);
    onSubmit({ shipment: "yes", pickupDate, deliveredDate });
  };

  const handleDialogCancel = () => {
    setPickupDate("");
    setDeliveredDate("");
    setValue("shipment", "");
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
