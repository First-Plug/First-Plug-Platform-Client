"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { ChevronDown } from "@/shared";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared";
import { cn } from "@/shared";

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

// Helper function to extract value from option
const getOptionValue = (option: string | OptionItem): string => {
  return typeof option === "string" ? option : option.value;
};

// Helper function to get display text from option
const getOptionDisplayText = (option: string | OptionItem): string => {
  return typeof option === "string" ? option : option.value;
};

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
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>(selectedOption || "");
  const [hasCustomValue, setHasCustomValue] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<(HTMLLIElement | null)[]>([]);
  const isUserTypingRef = useRef(false);

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

  // Filtrar opciones basado en búsqueda
  const filteredOptions = useMemo(() => {
    if (!searchable || !searchTerm.trim()) {
      return options;
    }

    const normalizedSearch = normalizeString(searchTerm).toLowerCase();

    return options.filter((option) => {
      const text = getOptionDisplayText(option);
      const normalizedText = normalizeString(text).toLowerCase();
      return normalizedText.includes(normalizedSearch);
    });
  }, [options, searchTerm, searchable]);

  // Verificar si hay un valor personalizado
  useEffect(() => {
    if (allowCustomInput && searchTerm.trim()) {
      const normalizedInput = normalizeString(searchTerm).toLowerCase();
      const exactMatch = options.some(
        (option) =>
          normalizeString(getOptionDisplayText(option)).toLowerCase() ===
          normalizedInput
      );
      setHasCustomValue(!exactMatch);
    } else {
      setHasCustomValue(false);
    }
  }, [searchTerm, options, allowCustomInput]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (searchable || allowCustomInput) {
      const inputValue = event.target.value;

      if (!validateInput(inputValue)) {
        return;
      }

      isUserTypingRef.current = true;
      setSearchTerm(inputValue);

      // Si permite input personalizado, llamar onChange en tiempo real
      if (allowCustomInput && onChange) {
        onChange(inputValue);
      }

      // Mantener el dropdown abierto cuando hay texto
      if (inputValue.length > 0) {
        setOpen(true);
      }
    }
  };

  const handleOptionClick = (option: string | OptionItem) => {
    if (!disabled) {
      const value = getOptionValue(option);
      const displayText = getOptionDisplayText(option);

      isUserTypingRef.current = false;

      // Cerrar el popover primero
      setOpen(false);

      // Actualizar el valor
      setSearchTerm(displayText);
      setHasCustomValue(false);

      // Llamar onChange después de un pequeño delay para asegurar que el estado se actualice
      if (onChange) {
        // Usar setTimeout para asegurar que el popover se cierre primero
        setTimeout(() => {
          onChange(value);
        }, 0);
      }

      setTimeout(() => {
        inputRef.current?.blur();
      }, 0);
    }
  };

  const handleInputBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    isUserTypingRef.current = false;

    const relatedTarget = event.relatedTarget as HTMLElement;
    if (
      allowCustomInput &&
      searchTerm &&
      (!relatedTarget ||
        !event.currentTarget
          .closest("[data-radix-portal]")
          ?.contains(relatedTarget))
    ) {
      if (onChange) {
        onChange(searchTerm);
      }
    }

    setTimeout(() => {
      setOpen(false);
    }, 200);
  };

  // Actualizar searchTerm desde selectedOption cuando cambia externamente
  useEffect(() => {
    if (!isUserTypingRef.current && selectedOption !== searchTerm) {
      setSearchTerm(selectedOption || "");
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

  // Preparar opciones para mostrar (con custom value al inicio si aplica)
  const optionsToShow = useMemo(() => {
    if (allowCustomInput && hasCustomValue && searchTerm.trim()) {
      return [searchTerm, ...filteredOptions];
    }
    return filteredOptions;
  }, [filteredOptions, hasCustomValue, searchTerm, allowCustomInput]);

  return (
    <div className={cn("relative", className)}>
      <label className="block ml-2 font-sans text-dark-grey">{title}</label>
      <div className="relative">
        <Popover open={open} onOpenChange={setOpen}>
          {isCustomDisplay && !searchable ? (
            <PopoverTrigger asChild>
              <div
                ref={inputRef}
                className={cn(
                  "flex items-center bg-white p-4 py-2 pr-12 pl-4 border border-gray-300 rounded-xl w-full h-14 font-sans text-black cursor-pointer",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
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
            </PopoverTrigger>
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
                onChange={handleSearch}
                onBlur={handleInputBlur}
                onFocus={() => {
                  if (allowCustomInput || searchable) {
                    setOpen(true);
                  }
                }}
                onClick={() => {
                  if (!allowCustomInput) {
                    setOpen(true);
                  }
                }}
                className={cn(
                  "p-4 py-2 pr-12 pl-4 border rounded-xl focus:outline-none w-full h-14 font-sans text-black",
                  allowCustomInput ? "cursor-text" : "cursor-pointer"
                )}
                name={name}
                disabled={disabled}
                autoComplete="off"
              />
              <div
                onClick={() => {
                  if (!allowCustomInput) {
                    setOpen(true);
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

          <PopoverContent
            className="p-0 w-[var(--radix-popover-trigger-width)]"
            align="start"
            onInteractOutside={(e) => {
              // Prevenir que se cierre si el click fue en el trigger
              const target = e.target as HTMLElement;
              if (inputRef.current?.contains(target)) {
                e.preventDefault();
              }
            }}
            onOpenAutoFocus={(e) => {
              if (searchable && inputRef.current) {
                e.preventDefault();
                setTimeout(() => {
                  inputRef.current?.focus();
                }, 50);
              }
            }}
          >
            <ul
              className="bg-white shadow-lg border border-gray-300 rounded-lg max-h-48 overflow-y-auto"
              onMouseDown={(e) => {
                // Solo prevenir si el click es en el ul mismo, no en los hijos
                if (e.target === e.currentTarget) {
                  e.preventDefault();
                }
              }}
              onClick={(e) => {
                // Prevenir que el click se propague al contenedor padre
                e.stopPropagation();
              }}
            >
              {optionsToShow.length > 0 ? (
                optionsToShow.map((option, index) => {
                  const optionValue =
                    typeof option === "string"
                      ? option
                      : getOptionValue(option);
                  const isCustomValue =
                    allowCustomInput &&
                    hasCustomValue &&
                    index === 0 &&
                    optionValue === searchTerm;

                  return (
                    <li
                      key={`${optionValue}-${index}`}
                      ref={(el) => (optionRefs.current[index] = el)}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        if (typeof option === "string" && allowCustomInput) {
                          handleOptionClick(option);
                        } else {
                          handleOptionClick(option as OptionItem);
                        }
                      }}
                      className={cn(
                        "hover:bg-gray-100 px-4 py-2 cursor-pointer",
                        isCustomValue && "bg-blue-50 font-medium",
                        optionClassName
                      )}
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
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

