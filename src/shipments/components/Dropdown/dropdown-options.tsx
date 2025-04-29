"use client";
import type React from "react";
import { useRef } from "react";
import { useDropdown } from "./context/dropdown-context";
import { DropdownOption } from "./dropdown-option";

interface DropdownOptionsProps {
  children?: React.ReactNode;
  className?: string;
  maxHeight?: string;
  renderOption?: (option: { value: string; label: string }) => React.ReactNode;
  emptyMessage?: string;
}

export function DropdownOptions({
  className = "",
  maxHeight = "12rem",
  renderOption,
  emptyMessage = "No options available",
}: DropdownOptionsProps) {
  const { isOpen, filteredOptions } = useDropdown();
  const optionsRef = useRef<HTMLUListElement>(null);

  return (
    <ul
      ref={optionsRef}
      className={`absolute z-10 top-full left-0 w-full border border-gray-300 bg-white rounded-lg shadow-lg overflow-y-auto ${
        isOpen ? "block" : "hidden"
      } ${className}`}
      style={{ maxHeight }}
    >
      {filteredOptions.length > 0 ? (
        <>
          {filteredOptions.map((option) => (
            <DropdownOption key={option.value} value={option.value}>
              {renderOption ? renderOption(option) : option.label}
            </DropdownOption>
          ))}
        </>
      ) : (
        <li className="py-2 px-4 text-gray-500 italic">{emptyMessage}</li>
      )}
    </ul>
  );
}

DropdownOptions.displayName = "DropdownOptions";
