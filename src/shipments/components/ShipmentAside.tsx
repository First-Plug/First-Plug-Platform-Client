import { useState } from "react";
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
import CategoryIcons from "@/components/AsideContents/EditTeamAside/CategoryIcons";
import { MapPin } from "lucide-react";
import { AsapOrDate } from "./ShipmentWithFp";
import { AsapOrDateValue } from "./ShipmentWithFp/asap-or-date";
import { useStore } from "@/models";

export const ShipmentAside = () => {
  const {
    aside: { setAside },
  } = useStore();

  const queryClient = useQueryClient();
  const shipment = queryClient.getQueryData(["shipment"]) as Shipment;

  const [pickupDate, setPickupDate] = useState<AsapOrDateValue>("");
  const [deliveredDate, setDeliveredDate] = useState<AsapOrDateValue>("");

  const selectedMember = { _id: "" };

  const { data: members } = useFetchMembers();

  console.log(members);

  console.log(shipment);

  const handleSearch = () => {};

  const handleSelectMember = (member: any) => {};

  const closeAside = () => {
    setAside(undefined);
    queryClient.removeQueries({ queryKey: ["shipment"] });
  };

  return (
    <div className="mt-8 flex flex-col gap-8">
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
          <SelectOption value={shipment.origin}>{shipment.origin}</SelectOption>
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
        <div className="flex flex-col gap-2 w-full overflow-y-auto scrollbar-custom mt-4 2xl:h-[200px]">
          {members.map((member) => (
            <div
              className={`flex gap-2 items-center py-2 px-4 border cursor-pointer rounded-md transition-all duration-300 hover:bg-hoverBlue`}
              key={member._id}
              onClick={() => handleSelectMember(member)}
            >
              <input
                type="checkbox"
                checked={member._id === selectedMember?._id}
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
            onClick={() => {}}
            disabled
          >
            Save
          </Button>
        </div>
      </aside>
    </div>
  );
};
