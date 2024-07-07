"use client";
import React, { useState } from "react";
import { DoughnutChart } from "@/common";
import { MonitorIcon, DeviceTablet, PencilAccesories } from "@/common/Icons";
import { useStore } from "@/models/root.store";
import { observer } from "mobx-react-lite";

export const StockCard = observer(function () {
  const {
    products: { products, uniqueProducts },
  } = useStore();

  const [info, setInfo] = useState({ ...products[0] } || {});

  return (
    <div className={`flex p-4 gap-4 justify-between w-full h-full  `}>
      <div className="  flex flex-col justify-between  w-full   h-full overflow-y-auto  ">
        {uniqueProducts.map((equipment) => (
          <div
            key={equipment._id}
            className={` w-full  flex gap-2  font-medium cursor-pointer p-2 rounded-md hover:bg-light-grey ${
              info && info === equipment.category
                ? "text-blue bg-light-grey"
                : "bg-none"
            } `}
            onClick={() => setInfo(equipment)}
          >
            {equipment.category === "Computer" ||
            equipment.category === "Monitor" ? (
              <MonitorIcon />
            ) : (
              <DeviceTablet />
            )}
            {equipment.category}
          </div>
        ))}
      </div>
      <div className=" w-1/2  h-full ">
        <DoughnutChart data={info} />
      </div>
    </div>
  );
});
