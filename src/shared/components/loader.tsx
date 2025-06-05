import { LoaderSpinner } from "@/common";
import React from "react";

export const Loader = () => {
  return (
    <div className="place-items-center grid w-full h-full">
      <LoaderSpinner size="bg" />
    </div>
  );
};
