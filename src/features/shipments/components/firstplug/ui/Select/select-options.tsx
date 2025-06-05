import type React from "react";
import { useRef } from "react";
import { useSelect } from "./context/select-context";
import { SelectOption } from "./select-option";

interface SelectOptionsProps {
  children: React.ReactNode;
  className?: string;
  emptyMessage?: string;
}

export function SelectOptions({
  className = "",

  emptyMessage = "No options available",
}: SelectOptionsProps) {
  const { isOpen, filteredOptions } = useSelect();
  const optionsRef = useRef<HTMLUListElement>(null);

  return (
    <ul
      ref={optionsRef}
      className={`absolute z-10 top-full left-0 w-full border border-gray-300 bg-white rounded-lg shadow-lg overflow-y-auto ${
        isOpen ? "block" : "hidden"
      } ${className}`}
    >
      {filteredOptions.length > 0 ? (
        <>
          {filteredOptions.map((option) => (
            <SelectOption key={option.value} value={option.value}>
              {option.label}
            </SelectOption>
          ))}
        </>
      ) : (
        <li className="py-2 px-4 text-gray-500 italic">{emptyMessage}</li>
      )}
    </ul>
  );
}

SelectOptions.displayName = "SelectOptions";
