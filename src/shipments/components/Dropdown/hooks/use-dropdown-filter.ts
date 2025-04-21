"use client";
import type { DropdownOptionType } from "../context/dropdown-context";

export function useDropdownFilter() {
  const normalizeString = (str: string) =>
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const filterOptions = (
    options: DropdownOptionType[],
    searchTerm: string
  ): DropdownOptionType[] => {
    if (!searchTerm.trim()) {
      return [...options];
    }

    const normalizedInput = normalizeString(searchTerm.toLowerCase());
    return options.filter((option) =>
      normalizeString(option.label.toLowerCase()).includes(normalizedInput)
    );
  };

  return { filterOptions, normalizeString };
}
