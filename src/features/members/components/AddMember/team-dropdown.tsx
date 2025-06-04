"use client";
import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "@/common";
import { useStore } from "@/models/root.store";
import { TeamServices } from "@/services/team.services";

interface TeamDropdownProps {
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
}

export function TeamDropdown({
  title,
  placeholder,
  options = [],
  selectedOption,
  onChange,
  className,
  name,
  disabled,
}: TeamDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState<string>(selectedOption || "");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const {
    teams: { addTeam },
  } = useStore();

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleOptionClick = (option: string) => {
    if (!disabled) {
      onChange && onChange(option);
      setInputValue(option);
      setIsOpen(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setIsOpen(true);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleCreateNewTeam = async (teamName: string) => {
    try {
      const newTeam = await TeamServices.createTeam({ name: teamName });
      addTeam(newTeam);
      onChange && onChange(teamName);
      setInputValue(teamName);
      setIsOpen(false);
    } catch (error) {
      console.error("Error creating team:", error);
    }
  };

  useEffect(() => {
    if (!options.includes(inputValue) && inputValue) {
      handleCreateNewTeam(inputValue);
    }
  }, []);

  return (
    <div className={`relative ${className || ""}`} ref={dropdownRef}>
      <label className="block ml-2 font-sans text-dark-grey">{title}</label>
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          placeholder={placeholder}
          onChange={handleInputChange}
          onClick={toggleDropdown}
          className={`w-full h-14 py-2 pl-4 pr-12 rounded-xl border text-black p-4 font-sans focus:outline-none`}
          name={name}
          disabled={disabled}
        />
        <div onClick={toggleDropdown}>
          <ChevronDown
            className="top-1/2 right-3 absolute -translate-y-1/2 cursor-pointer transform"
            stroke={2}
            color="grey"
          />
        </div>

        <ul
          className={`absolute z-10 top-full left-0 w-full border border-gray-300 bg-white rounded-lg shadow-lg overflow-y-auto max-h-48 ${
            isOpen ? "block" : "hidden"
          }`}
        >
          {options
            .filter((option) =>
              option.toLowerCase().includes(inputValue.toLowerCase())
            )
            .map((option) => (
              <li
                key={option}
                onClick={() => handleOptionClick(option)}
                className="hover:bg-gray-100 px-4 py-2 cursor-pointer"
              >
                {option}
              </li>
            ))}
          {!options.includes(inputValue) && inputValue && (
            <li
              onClick={() => handleCreateNewTeam(inputValue)}
              className="hover:bg-gray-100 px-4 py-2 cursor-pointer"
            >
              Create new team &quot;{inputValue}&quot;
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
