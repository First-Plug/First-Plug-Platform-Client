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
  isLoading?: boolean;
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
  isLoading = false,
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
  const isUserTypingRef = useRef(false);
  const isClickingInsideRef = useRef(false);

  // Helper function to extract value from option
  const getOptionValue = (option: string | OptionItem): string => {
    return typeof option === "string" ? option : option.value;
  };

  // Helper function to get display text from option
  const getOptionDisplayText = (option: string | OptionItem): string => {
    if (typeof option === "string") {
      return option;
    }
    // Para OptionItem, usar el value como display text
    return option.value;
  };

  const toggleDropdown = (e?: React.MouseEvent) => {
    if (!disabled && !isLoading) {
      // Prevenir que el evento se propague para evitar que handleClickOutside se ejecute
      if (e) {
        e.stopPropagation();
      }
      setIsOpen((prev) => {
        const newState = !prev;
        if (newState) {
          // Inicializar las opciones filtradas con todas las opciones disponibles
          setFilteredOptions([...options]);
          setSearchTerm(selectedOption || "");
          // Asegurar que el input tenga focus para que el onFocus funcione correctamente
          setTimeout(() => {
            inputRef.current?.focus();
          }, 0);
        }
        return newState;
      });
    }
  };

  const handleOptionClick = (option: string | OptionItem) => {
    if (!disabled) {
      const value = getOptionValue(option);
      const displayText = getOptionDisplayText(option);
      isUserTypingRef.current = false;
      if (onChange) {
        onChange(value);
      }
      setSearchTerm(displayText);
      setHasCustomValue(false);
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
        // Usar setTimeout para asegurar que el estado se actualice después del evento de clic
        setTimeout(() => {
          setIsOpen(false);
          if (!allowCustomInput) {
            setSearchTerm(selectedOption || "");
          }
        }, 0);
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

      if (!validateInput(inputValue)) {
        return;
      }

      // Marcar que el usuario está tipeando
      isUserTypingRef.current = true;

      setSearchTerm(inputValue);

      // Si permite input personalizado, llamar onChange en tiempo real
      if (allowCustomInput) {
        onChange && onChange(inputValue);
      }

      // Filtrar opciones
      const matchingOptions = options.filter((option) =>
        normalizeString(getOptionDisplayText(option))
          .toLowerCase()
          .includes(normalizeString(inputValue).toLowerCase())
      );

      // Si permite input personalizado y hay texto
      if (allowCustomInput && inputValue.trim().length > 0) {
        const normalizedInput = normalizeString(inputValue).toLowerCase();
        const exactMatch = options.some(
          (option) =>
            normalizeString(getOptionDisplayText(option)).toLowerCase() ===
            normalizedInput
        );

        if (!exactMatch) {
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

      // Mantener el dropdown abierto cuando hay texto
      setIsOpen(inputValue.length > 0);
    }
  };

  const handleInputBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    isUserTypingRef.current = false;

    const relatedTarget = event.relatedTarget as HTMLElement;
    // Solo actualizar con searchTerm si el usuario estaba escribiendo y no seleccionó una opción
    // Si se seleccionó una opción, selectedOption ya tiene el valor correcto
    if (
      allowCustomInput &&
      searchTerm &&
      (!relatedTarget || !dropdownRef.current?.contains(relatedTarget)) &&
      searchTerm !== selectedOption
    ) {
      // Verificar si el searchTerm coincide con alguna opción existente
      const normalizedSearch = normalizeString(searchTerm).toLowerCase();
      const exactMatch = options.find(
        (option) =>
          normalizeString(getOptionDisplayText(option)).toLowerCase() ===
          normalizedSearch
      );

      // Si hay una coincidencia exacta, usar el valor de la opción, no el texto escrito
      if (exactMatch) {
        const matchedValue = getOptionValue(exactMatch);
        onChange && onChange(matchedValue);
        setSearchTerm(getOptionDisplayText(exactMatch));
      } else {
        // Si no hay coincidencia, usar el texto escrito como valor personalizado
        onChange && onChange(searchTerm);
      }
    }

    // Solo cerrar si el foco no se movió a un elemento dentro del dropdown
    // Usar un delay más largo para dar tiempo a que el click en una opción se procese
    setTimeout(() => {
      const activeElement = document.activeElement;
      if (
        !dropdownRef.current?.contains(activeElement) &&
        activeElement !== inputRef.current
      ) {
        setIsOpen(false);
      }
    }, 150);
  };

  useEffect(() => {
    if (isOpen) {
      // Usar un pequeño delay para asegurar que el dropdown esté completamente renderizado
      const timeoutId = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
        inputRef.current?.focus();
      }, 10);
      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener("mousedown", handleClickOutside);
      };
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

  // Solo actualizar searchTerm desde selectedOption si el usuario NO está tipeando
  useEffect(() => {
    if (!isUserTypingRef.current && selectedOption !== searchTerm) {
      // Buscar la opción que coincide con selectedOption para obtener el displayText correcto
      const matchingOption = options.find((opt) => {
        const value = getOptionValue(opt);
        return value === selectedOption;
      });

      // Si encontramos una opción que coincide, usar su displayText, sino usar selectedOption directamente
      const displayText = matchingOption
        ? getOptionDisplayText(matchingOption)
        : selectedOption;

      setSearchTerm(displayText || "");

      if (selectedOption) {
        const normalizedSelected =
          normalizeString(selectedOption).toLowerCase();
        const isExistingOption = options.some((opt) => {
          const optValue = getOptionValue(opt);
          return (
            normalizeString(optValue).toLowerCase() === normalizedSelected ||
            normalizeString(getOptionDisplayText(opt)).toLowerCase() ===
              normalizedSelected
          );
        });
        setHasCustomValue(!isExistingOption);
      } else {
        setHasCustomValue(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOption]);

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
            onClick={(e) => toggleDropdown(e)}
            onMouseDown={(e) => e.stopPropagation()}
            className={`w-full h-14 cursor-pointer py-2 pl-4 pr-12 rounded-xl border border-gray-300 bg-white text-black p-4 font-sans flex items-center ${
              disabled || isLoading ? "opacity-50 cursor-not-allowed" : ""
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
              value={
                searchable || allowCustomInput
                  ? searchTerm
                  : selectedOption || ""
              }
              placeholder={placeholder}
              readOnly={!searchable && !allowCustomInput}
              onClick={(e) => {
                // Si el input es readonly, abrir el dropdown al hacer clic
                const isReadOnly = !searchable && !allowCustomInput;
                if (isReadOnly && !disabled && !isLoading) {
                  e.stopPropagation();
                  if (!isOpen) {
                    // Inicializar las opciones filtradas con todas las opciones disponibles
                    setFilteredOptions([...options]);
                    setIsOpen(true);
                    setSearchTerm(selectedOption || "");
                    // Forzar focus para que el onFocus también se dispare
                    setTimeout(() => {
                      inputRef.current?.focus();
                    }, 0);
                  }
                }
              }}
              onMouseDown={(e) => {
                // Prevenir propagación para inputs readonly o no searchable
                const isReadOnly = !searchable && !allowCustomInput;
                if (isReadOnly) {
                  e.stopPropagation();
                } else if (!allowCustomInput) {
                  e.stopPropagation();
                }
              }}
              onChange={handleSearch}
              onBlur={handleInputBlur}
              onFocus={() => {
                // Abrir el dropdown cuando el input recibe focus
                if (!disabled && !isLoading && !isOpen) {
                  setIsOpen(true);
                  // Inicializar las opciones filtradas con todas las opciones disponibles
                  // Siempre sincronizar searchTerm con selectedOption cuando se recibe focus
                  // para asegurar que muestre la opción seleccionada, no lo que el usuario escribió antes
                  setSearchTerm(selectedOption || "");
                  setFilteredOptions([...options]);
                  isUserTypingRef.current = false;
                }
              }}
              className={`w-full h-14 py-2 pl-4 pr-12 rounded-xl border text-black p-4 font-sans focus:outline-none ${
                allowCustomInput ? "cursor-text" : "cursor-pointer"
              } ${isLoading ? "opacity-60 cursor-wait" : ""}`}
              name={name}
              disabled={disabled || isLoading}
              autoComplete="off"
            />
            <div
              onClick={(e) => {
                // El icono de chevron debe abrir el dropdown
                if (!allowCustomInput && !disabled && !isLoading) {
                  e.stopPropagation();
                  if (!isOpen) {
                    // Inicializar las opciones filtradas con todas las opciones disponibles
                    setFilteredOptions([...options]);
                    setIsOpen(true);
                    setSearchTerm(selectedOption || "");
                    // Forzar focus en el input
                    setTimeout(() => {
                      inputRef.current?.focus();
                    }, 0);
                  } else {
                    // Si ya está abierto, cerrarlo
                    setIsOpen(false);
                  }
                }
              }}
              onMouseDown={(e) => {
                if (!allowCustomInput) {
                  e.stopPropagation();
                }
              }}
            >
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
            // Prevenir que el input pierda el focus cuando se hace clic en las opciones
            e.preventDefault();
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {isLoading ? (
            <li className="px-4 py-6 text-gray-500 text-sm text-center cursor-default">
              <div className="flex justify-center items-center gap-2">
                <div className="border-2 border-gray-300 border-t-blue-600 rounded-full w-4 h-4 animate-spin"></div>
                <span>Loading options...</span>
              </div>
            </li>
          ) : filteredOptions.length > 0 ? (
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
