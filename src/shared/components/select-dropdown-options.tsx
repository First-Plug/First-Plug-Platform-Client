"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import { useState, useRef, useEffect } from "react";
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
  searchable?: boolean;
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
  searchable = false,
}: SelectDropdownOptionsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const isSmall = compact;

  const groupsToRender = optionGroups;

  // Normalizar texto para búsqueda sin acentos
  const normalizeText = (text: string): string => {
    return text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  };

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
    if (disabled) {
      setIsDropdownOpen(false);
      return;
    }
    setIsDropdownOpen(open);
    if (!open) {
      setSearchTerm("");
      setOpenGroups({});
    }
  };

  // Enfocar el input de búsqueda cuando se abre el dropdown
  useEffect(() => {
    if (isDropdownOpen && searchable && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 0);
    }
  }, [isDropdownOpen, searchable]);

  // Filtrar opciones basadas en el término de búsqueda
  const filterOptions = (
    opts: (string | OptionItem)[]
  ): (string | OptionItem)[] => {
    if (!searchable || !searchTerm.trim()) return opts;

    const normalizedSearch = normalizeText(searchTerm);

    return opts.filter((option) => {
      // Buscar en el display si es un objeto, o en el string directamente
      let textToSearch: string;
      if (typeof option === "string") {
        textToSearch = option;
      } else {
        // Buscar en el display (nombre visible) en lugar del value (ID)
        const displayText =
          typeof option.display === "string"
            ? option.display
            : String(option.display || "");
        textToSearch = displayText || option.value;
      }
      return normalizeText(textToSearch).includes(normalizedSearch);
    });
  };

  // Filtrar grupos de opciones
  const filterOptionGroups = (groups: OptionGroup[]): OptionGroup[] => {
    if (!searchable || !searchTerm.trim()) return groups;

    return groups
      .map((group) => ({
        ...group,
        options: filterOptions(group.options),
      }))
      .filter((group) => group.options.length > 0);
  };

  const filteredOptions = filterOptions(options);
  const filteredGroups = filterOptionGroups(groupsToRender);

  // Auto-abrir grupos cuando hay búsqueda activa
  useEffect(() => {
    if (searchable && searchTerm.trim() && filteredGroups.length > 0) {
      const newOpenGroups: Record<string, boolean> = {};
      filteredGroups.forEach((group) => {
        newOpenGroups[group.label] = true;
      });
      setOpenGroups(newOpenGroups);
    }
  }, [searchTerm, searchable]);

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

      <DropdownMenu.Root onOpenChange={handleOpenChange} modal={false}>
        <DropdownMenu.Trigger asChild>
          <button
            disabled={disabled}
            onMouseDown={(e) => {
              // Prevenir que el evento se propague para evitar que se cierre inmediatamente
              if (!disabled) {
                e.stopPropagation();
              }
            }}
            className={`relative w-full font-sans text-left border border-gray-300 ${
              disabled
                ? productFormStyle
                  ? "cursor-not-allowed pointer-events-none bg-light-grey"
                  : "text-disabled bg-light-grey cursor-not-allowed pointer-events-none"
                : "text-black cursor-pointer"
            } ${
              productFormStyle
                ? "h-14 cursor-pointer py-2 pl-4 pr-12 rounded-xl border text-black p-4 focus:outline-none"
                : "py-3 pr-12 pl-4 rounded-md"
            }`}
          >
            <div
              className={`flex items-center gap-2 ${
                isSmall ? "text-sm" : "text-base"
              } ${!value ? "text-grey" : "text-black"}`}
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
            className="z-50 bg-white shadow-lg border border-gray-200 rounded-md w-auto min-w-[var(--radix-dropdown-menu-trigger-width)] max-w-[400px] text-gray-900 text-sm"
            sideOffset={4}
          >
            {/* Input de búsqueda */}
            {searchable && (
              <div className="top-0 sticky bg-white p-2 border-gray-200 border-b">
                <div className="relative">
                  <Search className="top-1/2 left-2 absolute w-4 h-4 text-gray-400 -translate-y-1/2 transform" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search..."
                    className="px-8 py-1.5 border border-gray-200 focus:border-blue rounded focus:outline-none w-full text-sm"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            )}

            <div className="p-1 max-h-60 overflow-y-auto">
              {/* Mensaje cuando no hay resultados */}
              {searchable &&
                searchTerm.trim() &&
                filteredOptions.length === 0 &&
                filteredGroups.length === 0 && (
                  <div className="px-3 py-6 text-gray-500 text-sm text-center">
                    No results found
                  </div>
                )}

              {/* Renderizar opciones simples si se proporcionan */}
              {filteredOptions.map((option, optIdx) => {
                const optionValue =
                  typeof option === "string" ? option : option.value;
                const optionDisplay =
                  typeof option === "string" ? option : option.display;
                return (
                  <DropdownMenu.Item
                    key={`${optionValue}-${optIdx}`}
                    onSelect={() => onChange(optionValue)}
                    className="hover:bg-gray-100 px-3 py-2 rounded-sm outline-none text-gray-900 text-sm leading-4 whitespace-nowrap cursor-pointer"
                    title={optionValue}
                  >
                    {typeof optionDisplay === "string" ? (
                      <span>{optionDisplay}</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        {optionDisplay}
                      </div>
                    )}
                  </DropdownMenu.Item>
                );
              })}

              {/* Renderizar grupos de opciones como acordeón para que se desplieguen hacia abajo */}
              {filteredGroups.map((group, idx) => {
                const isOpen = !!openGroups[group.label];
                // Agregar separador si hay opciones directas antes o si no es el primer grupo
                const shouldAddSeparator =
                  (filteredOptions.length > 0 && idx === 0) || idx > 0;
                return (
                  <div
                    key={group.label}
                    className={`${
                      shouldAddSeparator
                        ? "mt-1 pt-1 border-t border-gray-100"
                        : "mt-1"
                    }`}
                  >
                    <button
                      type="button"
                      className="flex justify-between items-center hover:bg-gray-50 px-3 py-2 rounded-sm w-full text-gray-900 text-xs cursor-pointer"
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
                            typeof option === "string"
                              ? option
                              : option.display;
                          return (
                            <DropdownMenu.Item
                              key={`${optionValue}-${optIdx}`}
                              onSelect={() => onChange(optionValue)}
                              className="hover:bg-gray-100 px-3 py-2 rounded-sm outline-none text-gray-900 text-xs leading-4 whitespace-nowrap cursor-pointer"
                              title={
                                typeof option === "string"
                                  ? option
                                  : optionValue.startsWith("__") &&
                                      optionValue.endsWith("__")
                                    ? undefined
                                    : optionValue
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
            </div>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}
