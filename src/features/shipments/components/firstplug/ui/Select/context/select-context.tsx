import type React from "react";
import { createContext, useContext } from "react";

export type SelectOptionType = {
  value: string;
  label: string;
};

export type SelectContextType = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedValue: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  searchable?: boolean;
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  options: SelectOptionType[];
  filteredOptions: SelectOptionType[];
  setFilteredOptions: React.Dispatch<React.SetStateAction<SelectOptionType[]>>;
  color: "error" | "success" | "normal" | "grey";
  getSelectedLabel: () => string;
};

export const SelectContext = createContext<SelectContextType | undefined>(
  undefined
);

export const useSelect = () => {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error("useSelect debe ser usado dentro de un SelectProvider");
  }
  return context;
};
