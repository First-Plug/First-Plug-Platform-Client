import { useEffect, useRef, useState } from "react";
import {
  Select,
  SelectLabel,
  SelectOption,
  SelectOptions,
  SelectTrigger,
} from "@/firstplug/ui/Select";

import { useQueryClient } from "@tanstack/react-query";

import { Shipment } from "../interfaces/shipments-response.interface";

import { useFetchMembers } from "@/members/hooks";
import { Button, SearchInput } from "@/common";
import { MapPin } from "lucide-react";
import { AsapOrDate } from "./ShipmentWithFp";
import { AsapOrDateValue } from "./ShipmentWithFp/asap-or-date";
import { useStore } from "@/models";
import { LOCATION } from "@/types";
import { isValid, parseISO } from "date-fns";
import { useUpdateShipment } from "../hooks/useUpdateShipment";
import { useShipmentStore } from "../store/useShipmentStore";
type DestinationState =
  | { type: "employee"; assignedEmail: string }
  | { type: "location"; location: string };

const parseDesirableDate = (
  value: string | undefined | null
): AsapOrDateValue => {
  if (!value) return "";
  if (value === "ASAP") return "ASAP";
  const parsed = parseISO(value);
  return isValid(parsed) ? parsed : "";
};

export const ShipmentAside = () => {
  const {
    aside: { setAside },
    alerts: { setAlert },
  } = useStore();

  const updateShipmentMutation = useUpdateShipment();

  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (value: string) => {
    setSearchTerm(value.toLowerCase());
  };

  const handleSelectMember = (member: any) => {
    setDestination({ type: "employee", assignedEmail: member.email });
  };

  const handleSelectLocation = (value: string) => {
    setDestination({ type: "location", location: value });
  };

  const queryClient = useQueryClient();
  const shipment = queryClient.getQueryData(["shipment"]) as Shipment;

  const [pickupDate, setPickupDate] = useState<AsapOrDateValue>(
    parseDesirableDate(shipment.originDetails?.desirableDate)
  );

  const [deliveredDate, setDeliveredDate] = useState<AsapOrDateValue>(
    parseDesirableDate(shipment.destinationDetails?.desirableDate)
  );

  const [destination, setDestination] = useState<DestinationState>(() => {
    const email = shipment.destinationDetails?.assignedEmail;
    const loc = shipment.destination;
    if (email) return { type: "employee", assignedEmail: email };
    return { type: "location", location: loc || "" };
  });

  const { data: members } = useFetchMembers();

  const closeAside = () => {
    setAside(undefined);
    queryClient.removeQueries({ queryKey: ["shipment"] });
  };

  const originalDestination: DestinationState = shipment.destinationDetails
    ?.assignedEmail
    ? {
        type: "employee",
        assignedEmail: shipment.destinationDetails.assignedEmail,
      }
    : { type: "location", location: shipment.destination || "" };

  const originalPickupDate = parseDesirableDate(
    shipment.originDetails?.desirableDate
  );
  const originalDeliveredDate = parseDesirableDate(
    shipment.destinationDetails?.desirableDate
  );

  const isFormValid = () => {
    const isPickupValid = pickupDate !== "";
    const isDeliveredValid = deliveredDate !== "";
    const isDestinationValid =
      (destination.type === "employee" && destination.assignedEmail) ||
      (destination.type === "location" && destination.location);

    const allFieldsComplete =
      isPickupValid && isDeliveredValid && isDestinationValid;

    const isDestinationChanged =
      JSON.stringify(destination) !== JSON.stringify(originalDestination);

    const isPickupChanged =
      pickupDate !== originalPickupDate &&
      !(
        pickupDate instanceof Date &&
        originalPickupDate instanceof Date &&
        pickupDate.getTime() === originalPickupDate.getTime()
      );

    const isDeliveredChanged =
      deliveredDate !== originalDeliveredDate &&
      !(
        deliveredDate instanceof Date &&
        originalDeliveredDate instanceof Date &&
        deliveredDate.getTime() === originalDeliveredDate.getTime()
      );

    const anyFieldChanged =
      isDestinationChanged || isPickupChanged || isDeliveredChanged;

    return allFieldsComplete && anyFieldChanged;
  };

  const contentRef = useRef(null);
  const [needsPadding, setNeedsPadding] = useState(false);

  useEffect(() => {
    const checkForScroll = () => {
      if (contentRef.current) {
        const element = contentRef.current;

        const hasScroll = element.scrollHeight > element.clientHeight;
        setNeedsPadding(hasScroll);
      }
    };

    checkForScroll();
    window.addEventListener("resize", checkForScroll);

    return () => window.removeEventListener("resize", checkForScroll);
  }, [shipment, members]);

  const setExpandedShipmentId = useShipmentStore(
    (state) => state.setExpandedShipmentId
  );

  const handleSave = async () => {
    const updatedShipment = {
      desirableDateOrigin: pickupDate,
      desirableDateDestination: deliveredDate,
    };

    const response = await updateShipmentMutation.mutateAsync({
      id: shipment._id,
      body: updatedShipment,
    });

    setAlert("updateShipment", response.message);
    setExpandedShipmentId(null);
    closeAside();
  };

  const filteredMembers = members.filter((member) => {
    if (
      shipment.originDetails?.assignedEmail &&
      shipment.originDetails.assignedEmail === member.email
    ) {
      return false;
    }

    const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
    const email = member.email?.toLowerCase() || "";
    return fullName.includes(searchTerm) || email.includes(searchTerm);
  });

  const selectedMember =
    destination.type === "employee"
      ? members.find((m) => m.email === destination.assignedEmail)
      : null;

  const filteredLocations = LOCATION.filter(
    (location) => location !== shipment.origin && location !== "Employee"
  );

  return (
    <div
      ref={contentRef}
      className={`mt-8 h-full overflow-y-auto scrollbar-custom mb-10 ${
        needsPadding ? "pb-20" : ""
      }`}
    >
      <div className="flex flex-col gap-8 pr-4">
        <Select
          value={shipment.origin}
          onChange={() => {}}
          color={"grey"}
          className="w-full"
          disabled
        >
          <SelectLabel className="flex items-center ">
            <span className="text-black font-semibold">Origin</span>
          </SelectLabel>
          <SelectTrigger
            className="flex mt-2"
            placeholder="Select an option"
            icon={<MapPin className="text-dark-grey" />}
          />
          <SelectOptions>
            <SelectOption value={shipment.origin}>
              {shipment.origin}
            </SelectOption>
          </SelectOptions>
        </Select>

        <div>
          <span className="text-black font-semibold">Destination</span>

          <Select
            value={
              destination.type === "employee"
                ? destination.assignedEmail
                : destination.location
            }
            onChange={() => {}}
            color={"grey"}
            className="w-full mt-2"
            disabled
          >
            <SelectTrigger placeholder="Destination" />
            <SelectOptions>
              {destination.type === "employee" ? (
                <SelectOption value={destination.assignedEmail}>
                  {selectedMember
                    ? `${selectedMember.firstName} ${selectedMember.lastName}`
                    : destination.assignedEmail}
                </SelectOption>
              ) : (
                filteredLocations.map((location) => (
                  <SelectOption key={location} value={location}>
                    {location}
                  </SelectOption>
                ))
              )}
            </SelectOptions>
          </Select>
        </div>

        <hr />

        <div>
          <h2 className="text-black font-bold text-xl">Shipment Dates</h2>

          <div className="grid gap-4 py-4 h-[200px]">
            <AsapOrDate
              label="Pickup Date"
              value={pickupDate}
              onChange={setPickupDate}
            />
            <AsapOrDate
              label="Delivery Date"
              value={deliveredDate}
              onChange={setDeliveredDate}
            />
          </div>
        </div>

        <aside className="absolute py-2 bottom-0 left-0 w-full border-t bg-slate-50">
          <div className="flex w-5/6 mx-auto gap-2 justify-end py-2">
            <Button variant="secondary" className="px-8" onClick={closeAside}>
              Cancel
            </Button>
            <Button
              variant="primary"
              className="px-8"
              onClick={handleSave}
              disabled={!isFormValid()}
            >
              Save
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
};
