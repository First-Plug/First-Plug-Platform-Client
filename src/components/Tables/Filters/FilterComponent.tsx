import React, { useEffect, useRef, useState } from "react";
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
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [initialized, setInitialized] = useState<boolean>(false);

  useEffect(() => {
    setFilteredOptions([...options]);
    setSelectedOptions(initialSelectedOptions || []);
  }, [options, initialSelectedOptions]);

  //este useEffect hace que el selectAll y todas las opciones esten checked cuando abro el filtro
  useEffect(() => {
    if (!initialized && options.length > 0) {
      setSelectedOptions(options);
      setInitialized(true);
      onChange(options);
    }
  }, [options, initialized, onChange]);

  useEffect(() => {
    if (
      selectedOptions.length === filteredOptions.length &&
      filteredOptions.length > 0
    ) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedOptions, filteredOptions]);

  const handleSearch = (query: string) => {
    const filtered = options.filter((option) =>
      option.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredOptions(filtered);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedOptions([]);
      onChange([]);
    } else {
      setSelectedOptions(filteredOptions);
      onChange(filteredOptions);
    }
    setSelectAll(!selectAll);
  };

  const handleCheckboxChange = (option: string) => {
    const updatedSelectedOptions = selectedOptions.includes(option)
      ? selectedOptions.filter((o) => o !== option)
      : [...selectedOptions, option];

    setSelectedOptions(updatedSelectedOptions);
    onChange(updatedSelectedOptions);
  };

  const handleClearFilter = () => {
    setSelectedOptions([]);
    setFilteredOptions([...options]);
    setSelectAll(false);

    onChange([]);
    onClearFilter();
  };

  return (
    <div className="fixed bg-white p-6 w-64 shadow-lg z-50 overflow-visible">
      <div className="flex justify-end items-center mb-4">
        <IconX onClick={onClose} className="cursor-pointer" />
      </div>
      <SearchInput placeholder="Search..." onSearch={handleSearch} />
      <div className="space-x-2 mt-2 pb-1">
        <input type="checkbox" checked={selectAll} onChange={handleSelectAll} />
        <label>Select All</label>
      </div>
      <div className="p-2 max-h-60 overflow-y-auto">
        {filteredOptions.map((option) => (
          <div key={option} className="mt-2 flex items-start">
            <input
              type="checkbox"
              checked={selectedOptions.includes(option)}
              onChange={() => handleCheckboxChange(option)}
              className="mt-2"
            />
            <label className="ml-2 mt-2 leading-tight flex-1">
              {option || "No Data"}
            </label>
          </div>
        ))}
      </div>
      <button
        className="mt-4 p-2 bg-red-200 hover:bg-hoverBlue  rounded"
        onClick={handleClearFilter}
      >
        Clear Filter
      </button>
    </div>
  );
};

export default FilterComponent;
