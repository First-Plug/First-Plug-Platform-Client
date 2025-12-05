"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
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
  allowCustomInput?: boolean;
  inputType?: "text" | "numbers" | "letters";
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
  allowCustomInput = false,
  inputType = "text",
}: DropdownInputProductFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>(selectedOption || "");
  const [filteredOptions, setFilteredOptions] = useState<
    (string | OptionItem)[]
  >([...options]);
  const [hasCustomValue, setHasCustomValue] = useState(false);
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
      setHasCustomValue(false);
      // Cerrar inmediatamente al seleccionar una opción
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        // Si permite input personalizado, mantener el valor escrito
        if (!allowCustomInput) {
          setSearchTerm(selectedOption || "");
        }
      }
    },
    [allowCustomInput, selectedOption]
  );

  const normalizeString = (str: string) =>
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const validateInput = (value: string): boolean => {
    if (inputType === "numbers") {
      return /^\d*$/.test(value);
    }
    if (inputType === "letters") {
      return /^[a-zA-Z\s]*$/.test(value);
    }
    return true;
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (searchable || allowCustomInput) {
      const inputValue = event.target.value;

      // Validar según el tipo de input
      if (!validateInput(inputValue)) {
        return;
      }

      setSearchTerm(inputValue);

      // Si permite input personalizado, siempre llamar onChange en tiempo real
      if (allowCustomInput) {
        onChange && onChange(inputValue);
      }

      const matchingOptions = options.filter((option) =>
        normalizeString(getOptionDisplayText(option))
          .toLowerCase()
          .includes(normalizeString(inputValue).toLowerCase())
      );

      // Si permite input personalizado y hay texto que no coincide exactamente con ninguna opción,
      // agregar el valor escrito como opción adicional
      if (allowCustomInput && inputValue.trim().length > 0) {
        const normalizedInput = normalizeString(inputValue).toLowerCase();
        const exactMatch = options.some(
          (option) =>
            normalizeString(getOptionDisplayText(option)).toLowerCase() ===
            normalizedInput
        );

        if (!exactMatch) {
          // Agregar el valor personalizado como primera opción
          setFilteredOptions([inputValue, ...matchingOptions]);
          setHasCustomValue(true);
        } else {
          setFilteredOptions(matchingOptions);
          setHasCustomValue(false);
        }
      } else {
        setFilteredOptions(matchingOptions);
        setHasCustomValue(false);
      }

      // Mostrar dropdown si hay texto
      if (inputValue.length > 0) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
        setHasCustomValue(false);
      }
    }
  };

  const handleInputBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    // Si permite input personalizado, guardar el valor cuando pierde el foco
    // Pero no si el siguiente elemento es una opción del dropdown
    const relatedTarget = event.relatedTarget as HTMLElement;
    if (
      allowCustomInput &&
      searchTerm &&
      (!relatedTarget || !dropdownRef.current?.contains(relatedTarget))
    ) {
      onChange && onChange(searchTerm);
    }
    // Pequeño delay para permitir que el click en la opción se procese primero
    setTimeout(() => {
      setIsOpen(false);
    }, 200);
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
  }, [isOpen, handleClickOutside]);

  useEffect(() => {
    if (filteredOptions.length > 0 && isOpen) {
      const firstMatchingOption = optionRefs.current[0];
      firstMatchingOption?.scrollIntoView({ block: "nearest" });
    }
  }, [filteredOptions, isOpen]);

  useEffect(() => {
    if (selectedOption !== searchTerm) {
      setSearchTerm(selectedOption || "");
      // Resetear el estado de valor personalizado cuando cambia la opción seleccionada externamente
      if (selectedOption) {
        const normalizedSelected =
          normalizeString(selectedOption).toLowerCase();
        const isExistingOption = options.some(
          (opt) =>
            normalizeString(getOptionDisplayText(opt)).toLowerCase() ===
            normalizedSelected
        );
        setHasCustomValue(!isExistingOption);
      } else {
        setHasCustomValue(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
              type={inputType === "numbers" ? "text" : "text"}
              value={
                searchable || allowCustomInput
                  ? searchTerm
                  : selectedOption || ""
              }
              placeholder={placeholder}
              readOnly={!searchable && !allowCustomInput}
              onClick={allowCustomInput ? undefined : toggleDropdown}
              onChange={handleSearch}
              onBlur={handleInputBlur}
              onFocus={() => {
                if (allowCustomInput) {
                  setIsOpen(true);
                }
              }}
              className={`w-full h-14 py-2 pl-4 pr-12 rounded-xl border text-black p-4 font-sans focus:outline-none ${
                allowCustomInput ? "cursor-text" : "cursor-pointer"
              }`}
              name={name}
              disabled={disabled}
              autoComplete="off"
            />
            <div onClick={allowCustomInput ? undefined : toggleDropdown}>
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
          onMouseDown={(e) => {
            // Prevenir que el blur se dispare cuando se hace clic en una opción
            e.preventDefault();
          }}
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => {
              const optionValue = getOptionValue(option);
              const isCustomValue =
                allowCustomInput &&
                hasCustomValue &&
                index === 0 &&
                optionValue === searchTerm;

              return (
                <li
                  key={`${optionValue}-${index}`}
                  ref={(el) => (optionRefs.current[index] = el)}
                  onClick={() => handleOptionClick(option)}
                  className={`py-2 px-4 cursor-pointer hover:bg-gray-100 ${
                    isCustomValue ? "bg-blue-50 font-medium" : ""
                  } ${optionClassName}`}
                >
                  <div className="flex items-center gap-2">
                    {typeof option === "string" ? (
                      <>
                        {option}
                        {isCustomValue && (
                          <span className="ml-auto text-blue-600 text-xs">
                            (new)
                          </span>
                        )}
                      </>
                    ) : (
                      option.display
                    )}
                  </div>
                </li>
              );
            })
          ) : allowCustomInput ? (
            <li className="px-4 py-2 text-gray-500 italic cursor-default">
              Type to add custom value
            </li>
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
