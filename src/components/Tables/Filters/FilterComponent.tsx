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

  //   useEffect(() => {
  //     if (selectAll && selectedOptions.length !== options.length) {
  //       setSelectAll(false);
  //     }
  //   }, [selectedOptions, options.length, selectAll]);

  //   useEffect(() => {
  //     setFilteredOptions(options);
  //   }, [options]);

  const handleSearch = (query: string) => {
    const filtered = options.filter((option) =>
      option.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredOptions(filtered);
  };
  // need to check why select All is not working on Name filter
  const handleSelectAll = () => {
    const newSelectedOptions = selectAll ? [] : options;
    setSelectedOptions(newSelectedOptions);
    onChange(newSelectedOptions);
    setSelectAll(!selectAll);
  };

  const handleCheckboxChange = (option: string) => {
    const updatedSelectedOptions = selectedOptions.includes(option)
      ? selectedOptions.filter((o) => o !== option)
      : [...selectedOptions, option];

    setSelectedOptions(updatedSelectedOptions);
    onChange(updatedSelectedOptions);
  };

  const combinedOptions = Array.from(
    new Set([...filteredOptions, ...selectedOptions])
  );

  return (
    <div className="filter-component bg-white p-6 w-64 shadow-lg z-50">
      <SearchInput placeholder="Search..." onSearch={handleSearch} />
      <div className="space-x-2 mt-2">
        <input type="checkbox" checked={selectAll} onChange={handleSelectAll} />
        <label>Select All</label>
      </div>
      <div className="p-2">
        {combinedOptions.map((option) => (
          <div key={option} className="mt-2">
            <input
              type="checkbox"
              checked={selectedOptions.includes(option)}
              onChange={() => handleCheckboxChange(option)}
            />
            <label className="ml-2 mt-2">{option}</label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilterComponent;
