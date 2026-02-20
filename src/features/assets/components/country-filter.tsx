"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/shared/utils/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  Popover,
  PopoverContent,
  PopoverTrigger,
  CountryFlag,
  countriesByCode,
} from "@/shared";
import { CommandList } from "@/shared/components/ui/command";
import { useProductStore } from "@/features/assets";
import { AssetFilterField } from "./asset-filter-field";

export function CountryFilter() {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const { selectedCountry, setSelectedCountry } = useProductStore();

  const countries = React.useMemo(() => {
    return Object.entries(countriesByCode)
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const filteredCountries = React.useMemo(() => {
    if (!searchValue.trim()) return countries;

    const searchTerm = searchValue.toLowerCase().trim();
    return countries.filter(
      (country) =>
        country.name.toLowerCase().startsWith(searchTerm) ||
        country.name.toLowerCase().includes(` ${searchTerm}`)
    );
  }, [countries, searchValue]);

  const selectedCountryName = selectedCountry
    ? countriesByCode[selectedCountry]
    : null;

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSearchValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && filteredCountries.length === 1) {
      e.preventDefault();
      const country = filteredCountries[0];
      setSelectedCountry(selectedCountry === country.code ? null : country.code);
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <AssetFilterField
          hasValue={!!selectedCountry}
          onClear={() => setSelectedCountry(null)}
          asTrigger
        >
          <div className="flex justify-between items-center w-full min-w-0">
            {selectedCountry ? (
              <div className="flex items-center gap-2 min-w-0">
                <CountryFlag countryName={selectedCountry} size={16} />
                <span className="text-sm truncate">{selectedCountryName}</span>
              </div>
            ) : (
              <span className="text-gray-500 text-sm">
                Filter by country...
              </span>
            )}
            <ChevronsUpDown className="opacity-50 ml-2 w-4 h-4 shrink-0" />
          </div>
        </AssetFilterField>
      </PopoverTrigger>
      <PopoverContent className="bg-white p-0 w-[200px]">
        <Command onKeyDown={handleKeyDown}>
          <CommandInput
            placeholder="Search country..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandList>
            <CommandGroup heading="Countries">
              {filteredCountries.map((country) => (
                <CommandItem
                  key={country.code}
                  value={country.name}
                  onSelect={() => {
                    setSelectedCountry(
                      selectedCountry === country.code ? null : country.code
                    );
                    setOpen(false);
                  }}
                  className="flex items-center"
                >
                  <Check
                    className={cn(
                      "flex-shrink-0 mr-2 w-4 h-4",
                      selectedCountry === country.code
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  <div className="flex flex-shrink-0 justify-center items-center mr-2 w-4 h-4">
                    <CountryFlag countryName={country.code} size={16} />
                  </div>
                  <span className="flex-1">{country.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
