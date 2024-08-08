import React, { useEffect, useState } from "react";
import { SearchInput } from "../../../common/SearchInput";

interface FilterComponentProps {
  options: string[];
  onChange: (selectedOptions: string[]) => void;
}

const FilterComponent: React.FC<FilterComponentProps> = ({
  options,
  onChange,
}) => {
  const [filteredOptions, setFilteredOptions] = useState<string[]>(options);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState<boolean>(false);

  useEffect(() => {
    setFilteredOptions(options);
  }, [options]);

  useEffect(() => {
    if (selectedOptions.length === options.length && options.length > 0) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedOptions, options.length]);

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
      setSelectedOptions(options);
      onChange(options);
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

  return (
    <div className="filter-component bg-white p-6 w-64 shadow-lg z-50">
      <SearchInput placeholder="Search..." onSearch={handleSearch} />
      <div className="space-x-2 mt-2">
        <input type="checkbox" checked={selectAll} onChange={handleSelectAll} />
        <label>Select All</label>
      </div>
      <div className="p-2 max-h-60 overflow-y-auto">
        {options.map((option) => (
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
