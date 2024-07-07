import { LoaderSpinner } from "@/common";
import React from "react";

export function Loader() {
  return (
    <div className="h-full w-full bg- grid place-items-center">
      <LoaderSpinner size="bg" />
    </div>
  );
}
