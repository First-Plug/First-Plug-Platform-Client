import { LoaderSpinner } from "@/shared";
import React from "react";

export function PageLoader() {
  return (
    <div className="place-items-center grid w-full h-full">
      <LoaderSpinner size="bg" />
    </div>
  );
}
