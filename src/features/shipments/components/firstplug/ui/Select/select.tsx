"use client";
import React, { useMemo } from "react";
import { useRef } from "react";
import { SelectContext } from "./context/select-context";
import { useSelectState } from "./hooks/use-select-state";
import { useOutsideClick } from "./hooks/use-outside-click";

interface SelectProps {
  children: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  searchable?: boolean;
  color?: "error" | "success" | "grey";
  className?: string;
}

export function Select({
  children,
  value,
  onChange,
  disabled = false,
  searchable = false,
  color = "grey",
  className = "",
}: SelectProps) {
  const selectRef = useRef<HTMLDivElement>(null);

  const options = useMemo(() => {
    const optionsContainer = React.Children.toArray(children).filter(
      (child: any) =>
        React.isValidElement(child) &&
        typeof child.type !== "string" &&
        (child.type as any).displayName === "SelectOptions"
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
  } = useSelectState({ value, options });

  const handleOutsideClick = () => {
    setIsOpen(false);
    setSearchTerm(getSelectedLabel());
  };

  useOutsideClick({
    ref: selectRef,
    isOpen,
    onOutsideClick: handleOutsideClick,
  });

  return (
    <SelectContext.Provider
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
        color,
      }}
    >
      <div className={`relative ${className}`} ref={selectRef}>
        {children}
      </div>
    </SelectContext.Provider>
  );
}
