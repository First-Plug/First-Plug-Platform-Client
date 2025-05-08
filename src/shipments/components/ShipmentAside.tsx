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
  } = useStore();

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

  const handleSearch = () => {};

  const closeAside = () => {
    setAside(undefined);
    queryClient.removeQueries({ queryKey: ["shipment"] });
  };

  const isDestinationValid =
    (destination.type === "employee" && destination.assignedEmail !== "") ||
    (destination.type === "location" && destination.location !== "");

  const isPickupValid = pickupDate === "ASAP" || pickupDate instanceof Date;

  const isDeliveredValid =
    deliveredDate === "ASAP" || deliveredDate instanceof Date;

  const isFormValid = isDestinationValid && isPickupValid && isDeliveredValid;

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

  const handleSave = () => {
    const updatedShipment = {
      pickupDate,
      deliveredDate,
      destination,
    };

    console.log("Shipment data to save:", updatedShipment);

    closeAside();
  };

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
          <div className="w-full flex flex-col gap-2">
            <span className="text-black font-semibold">Destination</span>
            <SearchInput
              placeholder="Search Member"
              onSearch={handleSearch}
              className="w-full"
            />
          </div>
          <div className="flex flex-col gap-2 w-full overflow-y-auto scrollbar-custom mt-4 2xl:h-[120px]">
            {members.map((member) => (
              <div
                className={`flex gap-2 items-center py-2 px-4 border cursor-pointer rounded-md transition-all duration-300 hover:bg-hoverBlue`}
                key={member._id}
                onClick={() => handleSelectMember(member)}
              >
                <input
                  type="checkbox"
                  checked={
                    destination.type === "employee" &&
                    member.email === destination.assignedEmail
                  }
                />
                <div className="flex gap-2">
                  <p className="text-black font-bold">
                    {member.firstName} {member.lastName}
                  </p>
                  <span className="text-dark-grey">
                    {typeof member.team === "string"
                      ? member.team
                      : member.team?.name}
                  </span>
                  {/* <CategoryIcons products={member.products} /> */}
                </div>
              </div>
            ))}
          </div>

          <Select
            value={destination.type === "location" ? destination.location : ""}
            onChange={handleSelectLocation}
            color={"grey"}
            className="w-full"
          >
            <SelectTrigger
              className="flex mt-4"
              placeholder="Select Location"
            />
            <SelectOptions>
              {LOCATION.filter((e) => e !== "Employee").map((location) => (
                <SelectOption key={location} value={location}>
                  {location}
                </SelectOption>
              ))}
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
              disabled={!isFormValid}
            >
              Save
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
};
