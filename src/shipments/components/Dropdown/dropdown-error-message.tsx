import React from "react";
import { useDropdown } from "./context/dropdown-context";

export const DropdownErrorMessage = () => {
  const { errorMessage, isOpen } = useDropdown();

  return (
    <>
      {errorMessage && !isOpen && (
        <p className="text-red-500">{errorMessage}</p>
      )}
    </>
  );
};
