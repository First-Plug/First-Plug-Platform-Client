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
} from "@/shared";
import { CommandList } from "@/shared/components/ui/command";
import { useProductStore, useGetTableAssets } from "@/features/assets";
import { AssetFilterField } from "./asset-filter-field";

export function SerialFilter() {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const { selectedSerialNumber, setSelectedSerialNumber } = useProductStore();
  const { data: assets } = useGetTableAssets();

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

  const filteredSerialNumbers = React.useMemo(() => {
    if (!searchValue.trim()) return allSerialNumbers;

    const searchTerm = searchValue.toLowerCase().trim();
    return allSerialNumbers.filter((serial) =>
      serial.toLowerCase().includes(searchTerm)
    );
  }, [allSerialNumbers, searchValue]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSearchValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && filteredSerialNumbers.length === 1) {
      e.preventDefault();
      const serial = filteredSerialNumbers[0];
      setSelectedSerialNumber(
        selectedSerialNumber === serial ? null : serial
      );
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <AssetFilterField
          hasValue={!!selectedSerialNumber}
          onClear={() => setSelectedSerialNumber(null)}
          asTrigger
        >
          <div className="flex justify-between items-center w-full min-w-0">
            {selectedSerialNumber ? (
              <span className="text-sm truncate">{selectedSerialNumber}</span>
            ) : (
              <span className="text-gray-500 text-sm">
                Filter by serial number...
              </span>
            )}
            <ChevronsUpDown className="opacity-50 ml-2 w-4 h-4 shrink-0" />
          </div>
        </AssetFilterField>
      </PopoverTrigger>
      <PopoverContent className="bg-white p-0 w-[200px]">
        <Command onKeyDown={handleKeyDown}>
          <CommandInput
            placeholder="Search serial number..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandList>
            <CommandGroup heading="Serial Numbers">
              {filteredSerialNumbers.map((serial) => (
                <CommandItem
                  key={serial}
                  value={serial}
                  onSelect={() => {
                    setSelectedSerialNumber(
                      selectedSerialNumber === serial ? null : serial
                    );
                    setOpen(false);
                  }}
                  className="flex items-center"
                >
                  <Check
                    className={cn(
                      "flex-shrink-0 mr-2 w-4 h-4",
                      selectedSerialNumber === serial ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="flex-1">{serial}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
