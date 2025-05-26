import { useState, useEffect } from "react";
import type { SelectOptionType } from "../context/select-context";

interface UseSelectStateProps {
  value: string;
  options: SelectOptionType[];
}

export function useSelectState({ value, options }: UseSelectStateProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOptions, setFilteredOptions] = useState<SelectOptionType[]>([
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
