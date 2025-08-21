"use client";
import { IconX } from "@/shared";
import { AsideContent } from "./AsideContent";

import { useAsideStore } from "@/shared";
import { AsideTitle } from "./AsideTitle";
import { useQueryClient } from "@tanstack/react-query";

export var Aside = function Aside() {
  const { type, closeAside } = useAsideStore();

  const queryClient = useQueryClient();

  const handleCloseAside = () => {
    queryClient.removeQueries({ queryKey: ["shipment"] });
    queryClient.removeQueries({ queryKey: ["selectedLogisticsShipment"] });
    closeAside();
  };

  return (
    <>
      <div
        className={`fixed top-0 left-0 w-full h-full -z-0 backdrop-blur-[1px] bg-grey bg-opacity-50 cursor-pointer ${
          type ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={handleCloseAside}
      ></div>

      <aside
        className={`flex flex-col gap-2 fixed top-0 right-0 h-full w-[50%] min-w-[600px] shadow-md shadow-gray-400 px-14 py-10 bg-white z-30 transform transition-transform duration-300 ${
          type ? "translate-x-0" : "translate-x-full"
        } `}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-center">
          <h2 className="font-sans font-bold text-black text-2xl">
            <AsideTitle />
          </h2>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCloseAside();
            }}
          >
            <IconX className="w-8 h-8" />
          </button>
        </header>

        <div className={` h-[90%] `}>
          <AsideContent />
        </div>
      </aside>
    </>
  );
};
