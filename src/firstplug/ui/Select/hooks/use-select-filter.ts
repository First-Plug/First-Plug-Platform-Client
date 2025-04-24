import type { SelectOptionType } from "../context/select-context";

export function useSelectFilter() {
  const normalizeString = (str: string) =>
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const filterOptions = (
    options: SelectOptionType[],
    searchTerm: string
  ): SelectOptionType[] => {
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
