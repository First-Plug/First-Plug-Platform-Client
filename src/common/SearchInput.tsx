"use client";
import React, { useState } from "react";
import { SearchIcon } from "./Icons";

type SearchInputProps = {
  placeholder?: string;
  className?: string;
  width?: string | number;
  height?: string | number;
  onSearch?: (value: string) => void;
};

export function SearchInput({
  placeholder,
  className,
  onSearch,
}: SearchInputProps) {
  const [query, setQuery] = useState<string>("");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
    onSearch && onSearch(event.target.value);
  };
  return (
    <div
      className={`flex  border border-grey gap-2 items-center py-1 px-2  rounded-md  ${
        className || ""
      }`}
    >
      <SearchIcon className={" text-grey font-bold  "} />
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        className={`text-md font-normal leading-5  text-dark-grey border-none outline-none  `}
      />
    </div>
  );
}
