"use client";
import type React from "react";
import { forwardRef } from "react";
import { useDropdown } from "./context/dropdown-context";

interface DropdownOptionProps {
  value: string;
  children?: React.ReactNode;
  className?: string;
}

export const DropdownOption = forwardRef<HTMLLIElement, DropdownOptionProps>(
  ({ value, children, className = "" }, ref) => {
    const { onChange, setIsOpen, setSearchTerm, disabled, options } =
      useDropdown();

    const option = options.find((opt) => opt.value === value);
    const label = option ? option.label : value;

    const handleOptionClick = () => {
      if (!disabled) {
        onChange(value);
        setSearchTerm(label);
        setIsOpen(false);
      }
    };

    return (
      <li
        ref={ref}
        onClick={handleOptionClick}
        className={`py-2 px-4 cursor-pointer hover:bg-gray-100 ${className}`}
      >
        {children || label}
      </li>
    );
  }
);

DropdownOption.displayName = "DropdownOption";
