import { Location } from "@/types";
import React from "react";

export function ProductLocation({ location }: { location: Location }) {
  return (
    <span
      className={`p-1 px-2  text-xs ${
        location
          ? location === "Employee"
            ? "bg-lightPurple"
            : "bg-lightGreen"
          : "bg-light-grey"
      } rounded-md `}
    >
      {location ? location : "No Location"}
    </span>
  );
}
