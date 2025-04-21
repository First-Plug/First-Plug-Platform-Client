"use client";
import React, { useMemo } from "react";
import { useRef } from "react";
import { DropdownContext } from "./context/dropdown-context";
import { useDropdownState } from "./hooks/use-dropdown-state";
import { useOutsideClick } from "./hooks/use-outside-click";

interface DropdownProps {
  children: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  searchable?: boolean;
  errorMessage?: string;
  color?: "error" | "success" | "normal" | "grey";
  className?: string;
}

export function Dropdown({
  children,
  value,
  onChange,
  disabled = false,
  searchable = false,
  errorMessage = "",
  color = "normal",
  className = "",
}: DropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  const options = useMemo(() => {
    const optionsContainer = React.Children.toArray(children).filter(
      (child: any) => child.type.name === "DropdownOptions"
    );

    if (!optionsContainer[0]) return [];

    return React.Children.toArray(
      (optionsContainer[0] as React.ReactElement).props.children
    )
      .filter((child: React.ReactNode) => React.isValidElement(child))
      .map((child: React.ReactNode) => {
        const validChild = child as React.ReactElement;

        const childContent = validChild.props.children;
        const childValue = validChild.props.value;

        if (typeof childValue !== "string") {
          throw new Error("El value de cada opción debe ser un string.");
        }

        if (typeof childContent !== "string") {
          throw new Error("El contenido de cada opción debe ser un string.");
        }

        return {
          value: childValue,
          label: childContent,
        };
      });
  }, [children]);

  const {
    isOpen,
    setIsOpen,
    searchTerm,
    setSearchTerm,
    filteredOptions,
    setFilteredOptions,
    getSelectedLabel,
  } = useDropdownState({ value, options });

  const handleOutsideClick = () => {
    setIsOpen(false);
    setSearchTerm(getSelectedLabel());
  };

  useOutsideClick({
    ref: dropdownRef,
    isOpen,
    onOutsideClick: handleOutsideClick,
  });

  return (
    <DropdownContext.Provider
      value={{
        isOpen,
        setIsOpen,
        selectedValue: value,
        onChange,
        disabled,
        searchable,
        searchTerm,
        setSearchTerm,
        options,
        filteredOptions,
        setFilteredOptions,
        getSelectedLabel,
        errorMessage,
        color,
      }}
    >
      <div className={`relative ${className}`} ref={dropdownRef}>
        {children}
      </div>
    </DropdownContext.Provider>
  );
}
