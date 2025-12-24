"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
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
import { useProductStore, useGetTableAssets } from "@/features/assets";

export function CountryFilter() {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const {
    selectedCountry,
    setSelectedCountry,
    selectedSerialNumber,
    setSelectedSerialNumber,
  } = useProductStore();
  const { data: assets } = useGetTableAssets();

  const countries = React.useMemo(() => {
    return Object.entries(countriesByCode)
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  // Obtener todos los serial numbers únicos de los assets
  const allSerialNumbers = React.useMemo(() => {
    if (!assets) return [];
    const serialNumbers = new Set<string>();
    assets.forEach((asset) => {
      asset.products?.forEach((product) => {
        if (product.serialNumber && product.serialNumber.trim()) {
          serialNumbers.add(product.serialNumber);
        }
      });
    });
    return Array.from(serialNumbers).sort();
  }, [assets]);

  const filteredCountries = React.useMemo(() => {
    if (!searchValue.trim()) return countries;

    const searchTerm = searchValue.toLowerCase().trim();
    return countries.filter(
      (country) =>
        country.name.toLowerCase().startsWith(searchTerm) ||
        country.name.toLowerCase().includes(` ${searchTerm}`)
    );
  }, [countries, searchValue]);

  const filteredSerialNumbers = React.useMemo(() => {
    if (!searchValue.trim()) return allSerialNumbers;

    const searchTerm = searchValue.toLowerCase().trim();
    return allSerialNumbers.filter((serial) =>
      serial.toLowerCase().includes(searchTerm)
    );
  }, [allSerialNumbers, searchValue]);

  const selectedCountryName = selectedCountry
    ? countriesByCode[selectedCountry]
    : null;

  const displayValue = React.useMemo(() => {
    if (selectedCountry) {
      return selectedCountryName;
    }
    if (selectedSerialNumber) {
      return selectedSerialNumber;
    }
    return null;
  }, [selectedCountry, selectedCountryName, selectedSerialNumber]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSearchValue("");
    }
  };

  return (
    <div className="flex items-center gap-2 bg-white">
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <button
            className="flex justify-between items-center bg-white hover:bg-gray-50 px-3 py-2 border border-gray-300 rounded-md w-[280px] h-9 transition-colors cursor-pointer"
            onClick={() => setOpen(!open)}
          >
            {displayValue ? (
              <div className="flex items-center gap-2">
                {selectedCountry && (
                  <CountryFlag countryName={selectedCountry} size={16} />
                )}
                <span className="text-sm truncate">{displayValue}</span>
              </div>
            ) : (
              <span className="text-gray-500 text-sm">
                Filter by country or serial number...
              </span>
            )}
            <ChevronsUpDown className="opacity-50 ml-2 w-4 h-4 shrink-0" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="bg-white p-0 w-[280px]">
          <Command>
            <CommandInput
              placeholder="Search country or serial number..."
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandList>
              {filteredCountries.length > 0 && (
                <CommandGroup heading="Countries">
                  {filteredCountries.map((country) => (
                    <CommandItem
                      key={country.code}
                      value={country.name}
                      onSelect={() => {
                        setSelectedCountry(
                          selectedCountry === country.code ? null : country.code
                        );
                        setSelectedSerialNumber(null);
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
              )}
              {filteredSerialNumbers.length > 0 && (
                <CommandGroup heading="Serial Numbers">
                  {filteredSerialNumbers.map((serial) => (
                    <CommandItem
                      key={serial}
                      value={serial}
                      onSelect={() => {
                        setSelectedSerialNumber(
                          selectedSerialNumber === serial ? null : serial
                        );
                        setSelectedCountry(null);
                        setOpen(false);
                      }}
                      className="flex items-center"
                    >
                      <Check
                        className={cn(
                          "flex-shrink-0 mr-2 w-4 h-4",
                          selectedSerialNumber === serial
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      <div className="flex flex-shrink-0 justify-center items-center mr-2 w-4 h-4" />
                      <span className="flex-1">{serial}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <div className="flex justify-center items-center w-8 h-8">
        {(selectedCountry || selectedSerialNumber) && (
          <button
            className="flex justify-center items-center hover:bg-gray-100 rounded-md w-8 h-8 transition-colors"
            onClick={() => {
              setSelectedCountry(null);
              setSelectedSerialNumber(null);
            }}
            title="Clear filter"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        )}
      </div>
    </div>
  );
}
