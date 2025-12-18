"use client";

import * as React from "react";
import { Check, ChevronDown, Plus, X } from "lucide-react";
import { cn } from "@/shared";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/shared/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";

interface MultiSelectInputProps {
  title?: string;
  placeholder?: string;
  options: string[];
  selectedValues: string[];
  onValuesChange: (values: string[]) => void;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  showAddButton?: boolean;
  inputMode?: "text" | "numeric";
}

export const MultiSelectInput: React.FC<MultiSelectInputProps> = ({
  title,
  placeholder = "Enter model name",
  options,
  selectedValues,
  onValuesChange,
  className,
  disabled = false,
  required = false,
  showAddButton = true,
  inputMode = "text",
}) => {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLButtonElement>(null);

  // Filtrar opciones que no están seleccionadas y que coinciden con el input
  const filteredOptions = React.useMemo(() => {
    const lowerInput = inputValue.toLowerCase().trim();
    if (!lowerInput)
      return options.filter((opt) => !selectedValues.includes(opt));
    return options.filter(
      (option) =>
        !selectedValues.includes(option) &&
        option.toLowerCase().includes(lowerInput)
    );
  }, [options, selectedValues, inputValue]);

  const handleUnselect = (value: string) => {
    onValuesChange(selectedValues.filter((v) => v !== value));
  };

  const handleSelect = (value: string) => {
    if (!selectedValues.includes(value)) {
      onValuesChange([...selectedValues, value]);
      setInputValue("");
      setOpen(false);
      inputRef.current?.focus();
    }
  };

  const handleAddCustom = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !selectedValues.includes(trimmedValue)) {
      onValuesChange([...selectedValues, trimmedValue]);
      setInputValue("");
      setOpen(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      handleAddCustom();
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    // Si es modo numérico, solo permitir números
    if (inputMode === "numeric") {
      value = value.replace(/[^0-9]/g, "");
    }
    setInputValue(value);
    // Abrir cuando el usuario empieza a escribir
    if (!open) {
      setOpen(true);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    // Solo actualizar si el cambio viene del Popover, no de nuestros handlers
    setOpen(newOpen);
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {title && (
        <label className="font-medium text-sm">
          {title}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      {/* Valores seleccionados arriba */}
      {selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-2 bg-gray-50 p-2 border border-gray-200 rounded-md min-h-[48px]">
          {selectedValues.map((value) => (
            <Badge
              key={value}
              variant="secondary"
              className="flex items-center gap-1 pr-1"
            >
              {value}
              <button
                type="button"
                onClick={() => handleUnselect(value)}
                className="hover:bg-gray-300 ml-1 rounded-full outline-none focus:ring-2 focus:ring-ring"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleUnselect(value);
                  }
                }}
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Input con botón + */}
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <button
            type="button"
            ref={containerRef as any}
            className="bg-transparent p-0 border-none w-full text-left"
            style={{ all: "unset", cursor: "text" }}
          >
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  ref={inputRef}
                  type={inputMode === "numeric" ? "number" : "text"}
                  inputMode={inputMode === "numeric" ? "numeric" : "text"}
                  placeholder={placeholder}
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  disabled={disabled}
                  className="pr-10"
                />
                {inputValue.trim() &&
                  !selectedValues.includes(inputValue.trim()) && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="top-1/2 right-1 z-10 absolute p-0 w-7 h-7 -translate-y-1/2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddCustom();
                      }}
                      disabled={disabled}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  )}
              </div>
            </div>
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="bg-white p-0 w-[var(--radix-popover-trigger-width)]"
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={(e) => {
            // Prevenir que se cierre si el click fue en el input, el botón +, o el contenedor
            const target = e.target as HTMLElement;
            if (
              inputRef.current?.contains(target) ||
              containerRef.current?.contains(target)
            ) {
              e.preventDefault();
            }
          }}
        >
          <Command shouldFilter={false}>
            <CommandList>
              {filteredOptions.length > 0 ? (
                <CommandGroup>
                  {filteredOptions.map((option) => (
                    <CommandItem
                      key={option}
                      value={option}
                      onSelect={() => handleSelect(option)}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "mr-2 w-4 h-4",
                          selectedValues.includes(option)
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {option}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ) : (
                <CommandEmpty>
                  {inputValue.trim()
                    ? "Press Enter or click + to add custom value"
                    : "No options available"}
                </CommandEmpty>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
