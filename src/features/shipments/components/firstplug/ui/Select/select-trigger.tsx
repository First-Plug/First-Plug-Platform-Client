import { ChevronDown } from "lucide-react";
import clsx from "clsx";
import { useRef } from "react";
import { useSelect } from "./context/select-context";
import { useSelectFilter } from "./hooks/use-select-filter";

interface SelectTriggerProps {
  icon?: React.ReactNode;
  placeholder?: string;
  name?: string;
  className?: string;
}

export function SelectTrigger({
  icon = <ChevronDown className="w-5 h-5 text-gray-500" />,
  placeholder,
  name,
  className = "",
}: SelectTriggerProps) {
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
  } = useSelect();

  const { filterOptions } = useSelectFilter();
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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (searchable) {
      const term = e.target.value;
      setSearchTerm(term);
      setFilteredOptions(filterOptions(options, term));
    }
  };

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
          "w-full pl-4 pr-12 rounded-md border text-black py-3 font-sans focus:outline-none",
          className,
          {
            "border-gray-300": color === "grey" || color === "normal",
            "border-error": color === "error",
            "border-success": color === "success",
            "cursor-default": disabled,
            "cursor-pointer": !disabled,
          }
        )}
        name={name}
        disabled={disabled}
        aria-disabled={disabled}
        autoComplete="off"
      />
      <div
        className={clsx("absolute right-3 top-1/2 transform -translate-y-1/2", {
          "cursor-default": disabled,
          "cursor-pointer": !disabled,
        })}
      >
        {icon}
      </div>
    </div>
  );
}
