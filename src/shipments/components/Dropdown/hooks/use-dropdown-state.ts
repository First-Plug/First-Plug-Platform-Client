"use client";
import { useState, useEffect } from "react";
import type { DropdownOptionType } from "../context/dropdown-context";

interface UseDropdownStateProps {
  value: string;
  options: DropdownOptionType[];
}

export function useDropdownState({ value, options }: UseDropdownStateProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOptions, setFilteredOptions] = useState<DropdownOptionType[]>([
    ...options,
  ]);

  const getSelectedLabel = (): string => {
    const selectedOption = options.find((option) => option.value === value);
    return selectedOption ? selectedOption.label : "";
  };

  useEffect(() => {
    setSearchTerm(getSelectedLabel());
  }, [value, options]);

  return {
    isOpen,
    setIsOpen,
    searchTerm,
    setSearchTerm,
    filteredOptions,
    setFilteredOptions,
    getSelectedLabel,
  };
}
