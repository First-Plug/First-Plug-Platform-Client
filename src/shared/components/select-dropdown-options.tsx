"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown, ChevronRight } from "lucide-react";

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
}: SelectDropdownOptionsProps) {
  const displayValue = value || placeholder;

  const defaultOptionGroups: OptionGroup[] = [
    {
      label: "Offices",
      options: [
        "Argentina - Buenos Aires",
        "Brasil - São Paulo",
        "Chile - Santiago",
        "Colombia - Bogotá",
        "México - Ciudad de México",
        "Perú - Lima",
        "Uruguay - Montevideo",
      ],
    },
    {
      label: "FP warehouses",
      options: ["Argentina - Buenos Aires", "Brasil - São Paulo"],
    },
  ];

  // Usar optionGroups si se proporcionan, sino usar los grupos por defecto
  const groupsToRender =
    optionGroups.length > 0 ? optionGroups : defaultOptionGroups;

  return (
    <div className={`w-full ${className}`}>
      <label className="block mb-2 font-semibold text-dark-grey">{label}</label>

      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            disabled={disabled}
            className="flex justify-between items-center bg-white disabled:opacity-50 px-3 py-3 border border-gray-300 hover:border-gray-400 rounded-md w-full h-12 text-sm text-left transition-colors disabled:cursor-not-allowed"
          >
            <span
              className={
                !value ? "text-gray-400 text-md" : "text-gray-900 text-md"
              }
            >
              {displayValue}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-600" />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="z-50 bg-white shadow-lg p-1 border border-gray-200 rounded-md min-w-[var(--radix-dropdown-menu-trigger-width)] text-gray-900"
            sideOffset={0}
          >
            {/* Renderizar opciones simples si se proporcionan */}
            {options.map((option) => (
              <DropdownMenu.Item
                key={option}
                onSelect={() => onChange(option)}
                className="hover:bg-gray-100 px-3 py-2 rounded-sm outline-none text-gray-900 text-sm cursor-pointer"
              >
                {option}
              </DropdownMenu.Item>
            ))}

            {/* Renderizar grupos de opciones con submenús */}
            {groupsToRender.map((group) => (
              <DropdownMenu.Sub key={group.label}>
                <DropdownMenu.SubTrigger className="flex justify-between items-center hover:bg-gray-100 px-3 py-2 rounded-sm outline-none text-gray-900 text-sm cursor-pointer">
                  {group.label}
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </DropdownMenu.SubTrigger>
                <DropdownMenu.SubContent className="z-50 bg-white shadow-lg p-1 border border-gray-200 rounded-md min-w-[180px] text-gray-900">
                  {group.options.map((option) => (
                    <DropdownMenu.Item
                      key={option}
                      onSelect={() => onChange(option)}
                      className="hover:bg-gray-100 px-3 py-2 rounded-sm outline-none text-gray-900 text-sm cursor-pointer"
                    >
                      {option}
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.SubContent>
              </DropdownMenu.Sub>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}
