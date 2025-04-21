"use client";
import type React from "react";
import { createContext, useContext } from "react";

export type DropdownOptionType = {
  value: string;
  label: string;
};

export type DropdownContextType = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedValue: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  searchable?: boolean;
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  options: DropdownOptionType[];
  filteredOptions: DropdownOptionType[];
  setFilteredOptions: React.Dispatch<
    React.SetStateAction<DropdownOptionType[]>
  >;
  errorMessage: string;
  color: "error" | "success" | "normal";
  getSelectedLabel: () => string;
};

export const DropdownContext = createContext<DropdownContextType | undefined>(
  undefined
);

export const useDropdown = () => {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error("useDropdown debe ser usado dentro de un DropdownProvider");
  }
  return context;
};
