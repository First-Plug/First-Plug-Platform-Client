import React, { useState } from "react";
import { SearchInput } from "../../../common/SearchInput";
import { IconX } from "../../../common/Icons";

interface FilterComponentProps {
  options: string[];
  onChange: (selectedOptions: string[]) => void;
  onClose: () => void;
}

const FilterComponent: React.FC<FilterComponentProps> = ({
  options,
  onChange,
  onClose,
}) => {
  const [filteredOptions, setFilteredOptions] = useState<string[]>(options);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState<boolean>(false);

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
      const allOptions = Array.from(new Set([...filteredOptions, ...options]));
      setSelectedOptions(allOptions);
      onChange(allOptions);
    }
    setSelectAll(!selectAll);
  };

  const handleCheckboxChange = (option: string) => {
    const updatedSelectedOptions = selectedOptions.includes(option)
      ? selectedOptions.filter((o) => o !== option)
      : [...selectedOptions, option];

    setSelectedOptions(updatedSelectedOptions);
    onChange(updatedSelectedOptions);

    if (updatedSelectedOptions.length !== options.length) {
      setSelectAll(false);
    }
  };

  const combinedOptions = Array.from(
    new Set([...filteredOptions, ...selectedOptions])
  );

  return (
    <div
      className="fixed top-0 left-0 bg-white p-6 w-64 shadow-lg z-50 overflow-visible "
      style={{ zIndex: 99 }}
    >
      <div className="flex justify-between items-center mb-4">
        <IconX onClick={onClose} className="cursor-pointer" />
      </div>
      <SearchInput placeholder="Search..." onSearch={handleSearch} />
      <div className="space-x-2 mt-2">
        <input type="checkbox" checked={selectAll} onChange={handleSelectAll} />
        <label>Select All</label>
      </div>
      <div className="p-2 max-h-60 overflow-y-auto">
        {combinedOptions.map((option) => (
          <div key={option} className="mt-2">
            <input
              type="checkbox"
              checked={selectedOptions.includes(option)}
              onChange={() => handleCheckboxChange(option)}
            />
            <label className="ml-2 mt-2">{option || "No Data"}</label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilterComponent;
