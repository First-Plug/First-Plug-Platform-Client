"use client";
import { IconX } from "@/common/Icons";
import { AsideContent } from "./";
import { observer } from "mobx-react-lite";
import { useStore } from "@/models/root.store";
import { AsideTitle } from "@/common";

export var Aside = observer(function Aside() {
  const {
    aside: { type, popAside, setAside, closeAside, stack },
  } = useStore();

  const handleCloseAside = () => {
    console.log("Closing aside. Current type:", type);
    console.log("Stack before close:", stack);
    const hasStack = stack.length > 0;
    if (hasStack) {
      console.log("Restoring previous aside from stack.");
      popAside();
    } else {
      console.log("No stack. Simply closing aside.");
      closeAside();
    }

    console.log("Stack after close:", stack);
  };

  const handleBack = () => {
    popAside();
  };

  return (
    <>
      <div
        className={`fixed top-0 left-0 w-full h-full -z-0 backdrop-blur-[1px] bg-grey bg-opacity-50 ${
          type ? "translate-x-0" : "translate-x-full"
        }`}
      ></div>

      <aside
        className={`flex flex-col gap-2 fixed top-0 right-0 h-full w-[50%] min-w-[600px] shadow-md shadow-gray-400 px-14 py-10 bg-white z-30 transform transition-transform duration-300 ${
          type ? "translate-x-0" : "translate-x-full"
        } `}
      >
        <header className="flex justify-between items-center">
          {stack.length > 0 && (
            <button onClick={handleBack} className="text-blue-500">
              Back
            </button>
          )}
          <h2 className="text-2xl font-sans text-black font-semibold">
            <AsideTitle />
          </h2>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCloseAside();
            }}
          >
            <IconX className="h-8 w-8" />
          </button>
        </header>

        <div className={` h-[90%] `}>
          <AsideContent />
        </div>
      </aside>
    </>
  );
});
