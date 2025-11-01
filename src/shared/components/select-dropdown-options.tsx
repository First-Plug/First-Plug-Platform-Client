"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import React from "react";

interface OptionItem {
  display: React.ReactNode;
  value: string;
}

interface OptionGroup {
  label: string;
  options: (string | OptionItem)[];
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
  productFormStyle?: boolean;
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
  productFormStyle = false,
}: SelectDropdownOptionsProps) {
  const groupsToRender = optionGroups;

  // Buscar el display personalizado si el valor seleccionado está en los optionGroups
  const getDisplayForValue = (val: string): React.ReactNode => {
    for (const group of optionGroups) {
      for (const option of group.options) {
        const optionValue = typeof option === "string" ? option : option.value;
        if (optionValue === val) {
          return typeof option === "string" ? option : option.display;
        }
      }
    }
    // Si no encuentra en optionGroups, buscar en options simples
    if (options.includes(val)) {
      return val;
    }
    // Si el valor existe pero no está en las opciones, devolverlo tal cual
    // Esto es útil para casos de update donde el valor viene de la base de datos
    if (val && val !== "") {
      return val;
    }
    return placeholder;
  };

  const displayValue = value ? getDisplayForValue(value) : placeholder;

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const toggleGroup = (groupLabel: string) => {
    setOpenGroups((prev) => ({ ...prev, [groupLabel]: !prev[groupLabel] }));
  };

  const handleOpenChange = (open: boolean) => {
    if (disabled) return false;
    return open;
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          className={`block font-sans text-dark-grey ${
            productFormStyle ? "ml-2" : compact ? "ml-2" : "mb-2"
          }`}
        >
          {label}
        </label>
      )}

      <DropdownMenu.Root onOpenChange={handleOpenChange}>
        <DropdownMenu.Trigger asChild>
          <button
            disabled={disabled}
            className={`relative w-full font-sans text-left border border-gray-300 ${
              disabled
                ? productFormStyle
                  ? "cursor-not-allowed pointer-events-none bg-light-grey"
                  : "text-disabled bg-light-grey cursor-not-allowed pointer-events-none"
                : "text-black cursor-pointer"
            } ${
              productFormStyle
                ? "h-14 cursor-pointer py-2 pl-4 pr-12 rounded-xl border text-black p-4 focus:outline-none"
                : compact
                ? "h-14 py-2 pl-4 pr-12 rounded-xl p-4"
                : "py-3 pr-12 pl-4 rounded-md"
            }`}
          >
            <div
              className={`flex items-center gap-2 ${
                !value ? "text-grey" : "text-black"
              }`}
            >
              {typeof displayValue === "string" ? (
                <span>{displayValue}</span>
              ) : (
                displayValue
              )}
            </div>
            <ChevronDown
              className={`top-1/2 absolute -translate-y-1/2 cursor-pointer transform ${
                productFormStyle ? "right-3" : "right-3"
              }`}
              strokeWidth={2}
              color={disabled ? "#A0A0A0" : "#AEB1B7"}
            />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="z-50 bg-white shadow-lg p-1 border border-gray-200 rounded-md w-auto min-w-[var(--radix-dropdown-menu-trigger-width)] max-w-[400px] max-h-60 overflow-y-auto text-gray-900 text-sm"
            sideOffset={4}
          >
            {/* Renderizar opciones simples si se proporcionan */}
            {options.map((option) => (
              <DropdownMenu.Item
                key={option}
                onSelect={() => onChange(option)}
                className="hover:bg-gray-100 px-3 py-2 rounded-sm outline-none text-gray-900 text-sm leading-4 whitespace-nowrap cursor-pointer"
                title={option}
              >
                <span>{option}</span>
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
                      {group.options.map((option, optIdx) => {
                        const optionValue =
                          typeof option === "string" ? option : option.value;
                        const optionDisplay =
                          typeof option === "string" ? option : option.display;
                        return (
                          <DropdownMenu.Item
                            key={`${optionValue}-${optIdx}`}
                            onSelect={() => onChange(optionValue)}
                            className="hover:bg-gray-100 px-3 py-2 rounded-sm outline-none text-gray-900 text-sm leading-4 whitespace-nowrap cursor-pointer"
                            title={
                              typeof option === "string" ? option : optionValue
                            }
                          >
                            <div className="flex items-center gap-2">
                              {optionDisplay}
                            </div>
                          </DropdownMenu.Item>
                        );
                      })}
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
