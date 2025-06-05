"use client";
import { useStore } from "@/models";
import { observer } from "mobx-react-lite";
import { ShipmentsTable } from "@/components/Tables";

export default observer(function DataShipments() {
  const {
    shipments: { shipmentsTable },
  } = useStore();

  return (
    <div className="overflow-y-auto h-full w-full relative  ">
      <div className="absolute w-full h-full ">
        <ShipmentsTable shipments={shipmentsTable} />
      </div>
    </div>
  );
});
