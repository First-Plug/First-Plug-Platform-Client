"use client";
import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "@/common";

interface DropdownInputProductFormProps {
  className?: string;
  title: string;
  placeholder?: string;
  options?: readonly string[];
  selectedOption?: string;
  onChange?: (option: string) => void;
  required?: string;
  name: string;
  value?: string;
  disabled?: boolean;
  searchable?: boolean;
}

export function DropdownInputProductForm({
  title,
  placeholder,
  options = [],
  selectedOption,
  onChange,
  className,
  name,
  disabled,
  searchable = false,
}: DropdownInputProductFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  // const [selectedValue, setSelectedValue] = useState<string>(selectedOption);
  const [searchTerm, setSearchTerm] = useState<string>(selectedOption || "");
  const [filteredOptions, setFilteredOptions] = useState<string[]>([
    ...options,
  ]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<(HTMLLIElement | null)[]>([]);

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setSearchTerm(selectedOption || "");
        setFilteredOptions([...options]);
      }
    }
  };

  const handleOptionClick = (option: string) => {
    if (!disabled) {
      onChange && onChange(option);
      setSearchTerm(option);
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
        normalizeString(option)
          .toLowerCase()
          .startsWith(normalizeString(inputValue).toLowerCase())
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

  return (
    <div className={`relative ${className || ""}`} ref={dropdownRef}>
      <label className="block text-dark-grey ml-2 font-sans">{title}</label>
      <div className="relative">
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
            className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
            stroke={2}
            color="grey"
          />
        </div>

        <ul
          className={`absolute z-10 top-full left-0 w-full border border-gray-300 bg-white rounded-lg shadow-lg overflow-y-auto max-h-48 ${
            isOpen ? "block" : "hidden"
          }`}
        >
          {filteredOptions.map((option, index) => (
            <li
              key={option}
              ref={(el) => (optionRefs.current[index] = el)}
              onClick={() => handleOptionClick(option)}
              className="py-2 px-4 cursor-pointer hover:bg-gray-100"
            >
              {option}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
