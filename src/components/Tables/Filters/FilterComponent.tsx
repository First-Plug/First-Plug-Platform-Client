import React, { useEffect, useState } from "react";
import { SearchInput } from "../../../common/SearchInput";
import { IconX } from "../../../common/Icons";

interface FilterComponentProps {
  options: string[];
  onChange: (selectedOptions: string[]) => void;
  onClose: () => void;
  onClearFilter: () => void;
  initialSelectedOptions?: string[];
}

const FilterComponent: React.FC<FilterComponentProps> = ({
  options,
  onChange,
  onClose,
  onClearFilter,
  initialSelectedOptions,
}) => {
  const [filteredOptions, setFilteredOptions] = useState<string[]>(options);
  const [selectedOptions, setSelectedOptions] = useState<string[]>(
    initialSelectedOptions || []
  );

  useEffect(() => {
    setSelectedOptions(initialSelectedOptions || []);
  }, [initialSelectedOptions]);

  useEffect(() => {
    setFilteredOptions([...options]);
  }, [options, onClose]);

  const handleSearch = (query: string) => {
    const normalizeString = (str: string) => {
      return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    };

    const normalizedQuery = normalizeString(query);

    const filtered = options.filter((option) =>
      normalizeString(option).includes(normalizedQuery)
    );

    setFilteredOptions(filtered);

    onChange(filtered);
  };

  const handleCheckboxChange = (option: string) => {
    const updatedSelectedOptions = selectedOptions.includes(option)
      ? selectedOptions.filter((o) => o !== option)
      : [...selectedOptions, option];

    setSelectedOptions(updatedSelectedOptions);
    onChange(updatedSelectedOptions);
  };

  const sortOptions = () => {
    const selected = filteredOptions
      .filter((option) => selectedOptions.includes(option))
      .sort((a, b) => {
        if (a === "No Data" || a === "Not Assigned") return 1;
        if (b === "No Data" || b === "Not Assigned") return -1;
        return a.localeCompare(b);
      });

    const unselected = filteredOptions
      .filter((option) => !selectedOptions.includes(option))
      .sort((a, b) => {
        if (a === "No Data" || a === "Not Assigned") return 1;
        if (b === "No Data" || b === "Not Assigned") return -1;
        return a.localeCompare(b);
      });

    return { selected, unselected };
  };

  const { selected, unselected } = sortOptions();

  const handleClearFilter = () => {
    setSelectedOptions([]);
    setFilteredOptions([...options]);
    onChange([]);
    onClearFilter();
  };

  return (
    <div className="fixed bg-white p-6 w-64 shadow-lg overflow-visible z-40">
      <div className="flex justify-end items-center mb-4">
        <IconX onClick={onClose} className="cursor-pointer" />
      </div>
      <SearchInput placeholder="Search..." onSearch={handleSearch} />
      <div className="p-2 max-h-60 overflow-y-auto">
        {selected.map((option) => (
          <div key={option} className="mt-2 flex items-start">
            <input
              type="checkbox"
              checked={selectedOptions.includes(option)}
              onChange={() => handleCheckboxChange(option)}
              id={option}
              className="mt-2"
            />
            <label htmlFor={option} className="ml-2 mt-2 leading-tight flex-1">
              {option || "No Data"}
            </label>
          </div>
        ))}

        {selected.length > 0 && unselected.length > 0 && (
          <div className="border-t my-2" />
        )}
        {unselected.map((option) => (
          <div key={option} className="mt-2 flex items-start">
            <input
              type="checkbox"
              checked={selectedOptions.includes(option)}
              onChange={() => handleCheckboxChange(option)}
              id={option}
              className="mt-2"
            />
            <label htmlFor={option} className="ml-2 mt-2 leading-tight flex-1">
              {option || "No Data"}
            </label>
          </div>
        ))}
      </div>
      <button
        className="mt-4 p-2 bg-red-200 hover:bg-hoverBlue rounded"
        onClick={handleClearFilter}
      >
        Clear Filter
      </button>
    </div>
  );
};

export default FilterComponent;
