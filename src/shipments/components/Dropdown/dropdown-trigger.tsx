import { useRef, useEffect } from "react";
import { useDropdown } from "./context/dropdown-context";
import { useDropdownFilter } from "./hooks/use-dropdown-filter";
import { ChevronDown } from "@/common";
import clsx from "clsx"; // Importar clsx

interface DropdownTriggerProps {
  children?: React.ReactNode;
  placeholder?: string;
  name?: string;
  className?: string;
}

export function DropdownTrigger({
  children = null,
  placeholder,
  name,
  className = "",
}: DropdownTriggerProps) {
  const {
    isOpen,
    setIsOpen,
    disabled,
    searchable,
    searchTerm,
    setSearchTerm,
    options,
    setFilteredOptions,
    getSelectedLabel,
    color,
  } = useDropdown();

  const { filterOptions } = useDropdownFilter();
  const inputRef = useRef<HTMLInputElement>(null);

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setSearchTerm(getSelectedLabel());
        setFilteredOptions([...options]);
      }
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (searchable) {
      const inputValue = event.target.value;
      setSearchTerm(inputValue);

      const matchingOptions = filterOptions(options, inputValue);
      setFilteredOptions(matchingOptions);

      if (!isOpen) {
        setIsOpen(true);
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={searchTerm}
        placeholder={placeholder}
        readOnly={!searchable}
        onClick={toggleDropdown}
        onChange={handleSearch}
        className={clsx(
          "w-full h-14 cursor-pointer py-2 pl-4 pr-12 rounded-xl border text-black p-4 font-sans focus:outline-none",
          className,
          {
            "border-gray-300": color === "grey" || color === "normal",
            "border-error": color === "error",
            "border-success": color === "success",
          }
        )}
        name={name}
        disabled={disabled}
        autoComplete="off"
      />
      <div
        onClick={children ? undefined : toggleDropdown}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
      >
        {children ? children : <ChevronDown color="grey" />}
      </div>
    </div>
  );
}
