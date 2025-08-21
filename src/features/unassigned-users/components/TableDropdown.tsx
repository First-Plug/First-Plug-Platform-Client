"use client";
import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

interface TableDropdownProps {
  options: string[];
  selectedOption: string;
  onChange: (option: string) => void;
  placeholder?: string;
  className?: string;
  searchable?: boolean;
  disabled?: boolean;
}

export const TableDropdown = ({
  options,
  selectedOption,
  onChange,
  placeholder,
  className = "",
  searchable = true,
  disabled = false,
}: TableDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>(selectedOption || "");
  const [filteredOptions, setFilteredOptions] = useState<string[]>([
    ...options,
  ]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const toggleDropdown = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchTerm(selectedOption || "");
      setFilteredOptions([...options]);
    }
  };

  const handleOptionClick = (option: string) => {
    if (disabled) return;
    onChange(option);
    setSearchTerm(option);
    setIsOpen(false);
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
    if (disabled || !searchable) return;
    const inputValue = event.target.value;
    setSearchTerm(inputValue);

    const matchingOptions = options.filter((option) =>
      normalizeString(option)
        .toLowerCase()
        .includes(normalizeString(inputValue).toLowerCase())
    );

    setFilteredOptions(matchingOptions);

    if (!isOpen) {
      setIsOpen(true);
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
    if (selectedOption !== searchTerm) {
      setSearchTerm(selectedOption || "");
    }
  }, [selectedOption]);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchable ? searchTerm : selectedOption || ""}
          placeholder={placeholder}
          readOnly={!searchable || disabled}
          onClick={disabled ? undefined : toggleDropdown}
          onChange={handleSearch}
          disabled={disabled}
          className={`py-1 pr-8 pl-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 w-full h-8 font-sans text-black text-xs cursor-pointer ${
            disabled ? "opacity-50 bg-gray-100" : ""
          }`}
          autoComplete="off"
        />
        <div onClick={disabled ? undefined : toggleDropdown}>
          <ChevronDown
            className={`top-1/2 right-2 absolute w-4 h-4 text-gray-500 -translate-y-1/2 cursor-pointer ${
              disabled ? "opacity-50" : ""
            }`}
            strokeWidth={2}
          />
        </div>

        <ul
          className={`absolute z-50 top-full left-0 w-full border border-gray-300 bg-white rounded-lg shadow-lg overflow-y-auto max-h-32 ${
            isOpen && !disabled ? "block" : "hidden"
          }`}
        >
          {filteredOptions.map((option) => (
            <li
              key={option}
              onClick={() => handleOptionClick(option)}
              className="hover:bg-gray-100 px-2 py-1 text-xs cursor-pointer"
            >
              {option}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
