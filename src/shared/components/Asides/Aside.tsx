"use client";
import { IconX } from "@/shared";
import { AsideContent } from "./AsideContent";

import { useAsideStore } from "@/shared";
import { AsideTitle } from "./AsideTitle";
import { useQueryClient } from "@tanstack/react-query";

export var Aside = function Aside() {
  const { stack, isClosed, closeAside, popAside } = useAsideStore();

  const queryClient = useQueryClient();

  const handleCloseAside = () => {
    queryClient.removeQueries({ queryKey: ["shipment"] });
    queryClient.removeQueries({ queryKey: ["selectedLogisticsShipment"] });
    closeAside();
  };

  const handlePopAside = () => {
    popAside();
  };

  const renderAside = (asideItem: any, index: number) => {
    const isTopAside = index === stack.length - 1;
    const zIndex = 30 + index;
    const rightOffset = index * 20; // Offset para mostrar múltiples sidebars

    return (
      <aside
        key={`${asideItem.type}-${index}`}
        className={`flex flex-col gap-2 fixed top-0 right-0 h-full w-[50%] min-w-[600px] shadow-md shadow-gray-400 px-14 py-10 bg-white transform transition-transform duration-300 ${
          isTopAside ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          zIndex,
          right: `${rightOffset}px`,
          width: `calc(50% - ${rightOffset}px)`,
          minWidth: `${600 - rightOffset}px`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-center">
          <h2 className="font-sans font-bold text-black text-2xl">
            <AsideTitle />
          </h2>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (stack.length > 1) {
                handlePopAside();
              } else {
                handleCloseAside();
              }
            }}
          >
            <IconX className="w-8 h-8" />
          </button>
        </header>

        <div className={` h-[90%] `}>
          <AsideContent />
        </div>
      </aside>
    );
  };

  return (
    <>
      <div
        className={`fixed top-0 left-0 w-full h-full -z-0 backdrop-blur-[1px] bg-grey bg-opacity-50 cursor-pointer ${
          !isClosed ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={handleCloseAside}
      ></div>

      {stack.map((asideItem, index) => renderAside(asideItem, index))}
    </>
  );
};
