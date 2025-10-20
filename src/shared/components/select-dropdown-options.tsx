"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

interface OptionGroup {
  label: string;
  options: string[];
}

interface SelectDropdownOptionsProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  options?: string[];
  optionGroups?: OptionGroup[];
  className?: string;
  disabled?: boolean;
  required?: boolean;
  compact?: boolean;
}

export default function SelectDropdownOptions({
  label,
  placeholder,
  value,
  onChange,
  options = [],
  optionGroups = [],
  className = "",
  disabled = false,
  required = false,
  compact = false,
}: SelectDropdownOptionsProps) {
  const displayValue = value || placeholder;

  const groupsToRender = optionGroups;

  // Estado para expandir/colapsar grupos
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const toggleGroup = (groupLabel: string) => {
    setOpenGroups((prev) => ({ ...prev, [groupLabel]: !prev[groupLabel] }));
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          className={`block font-sans text-dark-grey ${
            compact ? "ml-2" : "mb-2"
          }`}
        >
          {label}
        </label>
      )}

      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            disabled={disabled}
            className={`relative disabled:opacity-50 border border-gray-300 focus:outline-none w-full font-sans text-black text-left cursor-pointer disabled:cursor-not-allowed ${
              compact
                ? "h-14 py-2 pl-4 pr-12 rounded-xl p-4"
                : "py-3 pr-12 pl-4 rounded-md"
            }`}
          >
            <span className={!value ? "text-gray-400" : "text-black"}>
              {displayValue}
            </span>
            <ChevronDown
              className="top-1/2 right-3 absolute -translate-y-1/2 cursor-pointer transform"
              strokeWidth={2}
              color="grey"
            />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="z-50 bg-white shadow-lg p-1 border border-gray-200 rounded-md min-w-[var(--radix-dropdown-menu-trigger-width)] max-h-60 overflow-y-auto text-gray-900 text-sm"
            sideOffset={4}
          >
            {/* Renderizar opciones simples si se proporcionan */}
            {options.map((option) => (
              <DropdownMenu.Item
                key={option}
                onSelect={() => onChange(option)}
                className="hover:bg-gray-100 px-3 py-2 rounded-sm outline-none text-gray-900 text-sm leading-4 cursor-pointer"
                title={option}
              >
                <span className="max-w-[200px] truncate">{option}</span>
              </DropdownMenu.Item>
            ))}

            {/* Renderizar grupos de opciones como acordeón para que se desplieguen hacia abajo */}
            {groupsToRender.map((group, idx) => {
              const isOpen = !!openGroups[group.label];
              return (
                <div
                  key={group.label}
                  className={`${
                    idx > 0 ? "mt-1 pt-1 border-t border-gray-100" : "mt-1"
                  }`}
                >
                  <button
                    type="button"
                    className="flex justify-between items-center hover:bg-gray-50 px-3 py-2 rounded-sm w-full text-gray-900 text-sm cursor-pointer"
                    onClick={() => toggleGroup(group.label)}
                  >
                    <span className="font-medium">{group.label}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-600 transition-transform ${
                        isOpen ? "rotate-180" : "rotate-0"
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="pl-1">
                      {group.options.map((option) => (
                        <DropdownMenu.Item
                          key={option}
                          onSelect={() => onChange(option)}
                          className="hover:bg-gray-100 px-3 py-2 rounded-sm outline-none text-gray-900 text-sm leading-4 cursor-pointer"
                          title={option}
                        >
                          <span className="max-w-[200px] truncate">
                            {option}
                          </span>
                        </DropdownMenu.Item>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}
