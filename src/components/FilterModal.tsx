"use client";
import { DropDownArrow, SearchInput } from "@/shared";
import { useState } from "react";

interface FilterModalProps {
  items: string[];
  title: string;
  handleFilter: (filterItems: string[]) => void;
}

export const FilterModal = function ({
  items,
  title,
  handleFilter,
}: FilterModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<string[]>([]);
  const [checkboxes, setCheckboxes] = useState<boolean[]>([]);
  const allChecked = checkboxes.every(Boolean);

  const handleSelectAll = () => {
    setCheckboxes(Array(items.length).fill(allChecked));
  };

  const handleCheckboxChange = (index: number) => {
    const newCheckboxes = [...checkboxes];
    newCheckboxes[index] = !newCheckboxes[index];
    setCheckboxes(newCheckboxes);
  };

  const handleSelectFilter = (filter: string, index: number) => {
    handleCheckboxChange(index);
    setAppliedFilters((prevState) => {
      const isSelected = prevState.some(
        (appliedFilter) => appliedFilter === filter
      );
      if (!isSelected) {
        const addFilter = [...prevState, filter];
        handleFilter(addFilter);
        return addFilter;
      }

      const deleteFilter = prevState.filter(
        (appliedFilter) => appliedFilter !== filter
      );
      handleFilter(deleteFilter);
      return deleteFilter;
    });
  };

  return (
    <div className="relative h-10 text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        className="flex items-center gap-3 bg-white active:bg-gray-100 p-4 border rounded-md w-full h-full font-medium text-sm"
      >
        {title}
        <DropDownArrow
          className={`w-3 ${
            isOpen ? "rotate-[180deg]" : "rotate-[360deg]"
          } rotate-180 transition-all duration-300`}
        />
      </button>
      {isOpen && (
        <div className="z-10 absolute flex flex-col gap-2 bg-white p-4 border-2 rounded-md w-[20vw]">
          <SearchInput />
          <div className="flex flex-col gap-2 p-0 max-h-[7rem] overflow-y-auto">
            <div className="flex items-center gap-2 my-1">
              <input
                type="checkbox"
                className="w-5 h-5"
                onClick={handleSelectAll}
              />
              <label>Select All</label>
            </div>
            {items.map((filter, index) => (
              <div key={filter} className="flex items-center gap-2 ml-2">
                <input
                  type="checkbox"
                  className="w-5 h-5"
                  checked={checkboxes[index]}
                  onChange={() => handleSelectFilter(filter, index)}
                />
                <label>{filter}</label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
