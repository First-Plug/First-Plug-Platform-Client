"use client";
import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "@/shared";

export interface OptionItem {
  display: React.ReactNode;
  value: string;
}

interface DropdownInputProductFormProps {
  className?: string;
  title: string;
  placeholder?: string;
  options?: readonly (string | OptionItem)[];
  selectedOption?: string;
  onChange?: (option: string) => void;
  required?: string;
  name: string;
  value?: string;
  disabled?: boolean;
  searchable?: boolean;
  optionClassName?: string;
}

export const DropdownInputProductForm = ({
  title,
  placeholder,
  options = [],
  selectedOption,
  onChange,
  className,
  name,
  disabled,
  searchable = false,
  optionClassName = "",
}: DropdownInputProductFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>(selectedOption || "");
  const [filteredOptions, setFilteredOptions] = useState<
    (string | OptionItem)[]
  >([...options]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<(HTMLLIElement | null)[]>([]);

  // Helper function to extract value from option
  const getOptionValue = (option: string | OptionItem): string => {
    return typeof option === "string" ? option : option.value;
  };

  // Helper function to get display text from option
  const getOptionDisplayText = (option: string | OptionItem): string => {
    return typeof option === "string" ? option : option.value;
  };

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setSearchTerm(selectedOption || "");
        setFilteredOptions([...options]);
      }
    }
  };

  const handleOptionClick = (option: string | OptionItem) => {
    if (!disabled) {
      const value = getOptionValue(option);
      onChange && onChange(value);
      setSearchTerm(getOptionDisplayText(option));
      setIsOpen(false);
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
      setSearchTerm(selectedOption || "");
    }
  };

  const normalizeString = (str: string) =>
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (searchable) {
      const inputValue = event.target.value;
      setSearchTerm(inputValue);

      const matchingOptions = options.filter((option) =>
        normalizeString(getOptionDisplayText(option))
          .toLowerCase()
          .includes(normalizeString(inputValue).toLowerCase())
      );

      setFilteredOptions(matchingOptions);

      if (!isOpen) {
        setIsOpen(true);
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      inputRef.current?.focus();
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (filteredOptions.length > 0 && isOpen) {
      const firstMatchingOption = optionRefs.current[0];
      firstMatchingOption?.scrollIntoView({ block: "nearest" });
    }
  }, [filteredOptions, isOpen]);

  useEffect(() => {
    if (selectedOption !== searchTerm) {
      setSearchTerm(selectedOption || "");
    }
  }, [selectedOption]);

  // Helper to get display for selected value
  const getSelectedDisplay = () => {
    if (!selectedOption) return null;

    const selectedItem = options.find((option) => {
      const value = getOptionValue(option);
      return value === selectedOption;
    });

    if (selectedItem && typeof selectedItem !== "string") {
      return selectedItem.display;
    }

    return null;
  };

  const selectedDisplay = getSelectedDisplay();
  const isCustomDisplay = selectedDisplay !== null;

  return (
    <div className={`relative ${className || ""}`} ref={dropdownRef}>
      <label className="block ml-2 font-sans text-dark-grey">{title}</label>
      <div className="relative">
        {isCustomDisplay && !searchable ? (
          <div
            ref={inputRef}
            onClick={toggleDropdown}
            className={`w-full h-14 cursor-pointer py-2 pl-4 pr-12 rounded-xl border border-gray-300 bg-white text-black p-4 font-sans flex items-center ${
              disabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <div className="flex flex-1 items-center gap-2">
              {selectedDisplay}
            </div>
            <ChevronDown
              className="top-1/2 right-3 absolute -translate-y-1/2 cursor-pointer transform"
              stroke={2}
              color="grey"
            />
          </div>
        ) : (
          <>
            <input
              ref={inputRef}
              type="text"
              value={searchable ? searchTerm : selectedOption || ""}
              placeholder={placeholder}
              readOnly={!searchable}
              onClick={toggleDropdown}
              onChange={handleSearch}
              className={`w-full h-14 cursor-pointer py-2 pl-4 pr-12 rounded-xl border text-black p-4 font-sans focus:outline-none`}
              name={name}
              disabled={disabled}
              autoComplete="off"
            />
            <div onClick={toggleDropdown}>
              <ChevronDown
                className="top-1/2 right-3 absolute -translate-y-1/2 cursor-pointer transform"
                stroke={2}
                color="grey"
              />
            </div>
          </>
        )}

        <ul
          className={`absolute z-10 top-full left-0 w-full border border-gray-300 bg-white rounded-lg shadow-lg overflow-y-auto max-h-48 ${
            isOpen ? "block" : "hidden"
          }`}
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <li
                key={getOptionValue(option)}
                ref={(el) => (optionRefs.current[index] = el)}
                onClick={() => handleOptionClick(option)}
                className={`py-2 px-4 cursor-pointer hover:bg-gray-100 ${optionClassName}`}
              >
                <div className="flex items-center gap-2">
                  {typeof option === "string" ? option : option.display}
                </div>
              </li>
            ))
          ) : (
            <li className="px-4 py-2 text-gray-500 italic cursor-default">
              No matching options found
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};
