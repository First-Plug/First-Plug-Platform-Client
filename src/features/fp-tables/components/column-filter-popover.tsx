"use client";

import { useState, useRef } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/shared/components/ui/popover";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { ChevronDown, ChevronUp, Search, X, Loader2 } from "lucide-react";

interface Option {
  label: string;
  value: string;
}

interface ColumnFilterPopoverProps {
  options?: Option[];
  fetchOptions?: () => Promise<Option[]>;
  showSelectAll?: boolean;
  value?: string[];
  onChange?: (values: string[]) => void;
}

export function ColumnFilterPopover({
  options = [],
  fetchOptions,
  showSelectAll = true,
  value = [],
  onChange,
}: ColumnFilterPopoverProps) {
  const [open, setOpen] = useState(false);
  const [pendingSelected, setPendingSelected] = useState<string[]>(value);
  const [search, setSearch] = useState("");
  const [asyncOptions, setAsyncOptions] = useState<Option[] | null>(null);
  const [loading, setLoading] = useState(false);
  const fetchedRef = useRef(false);

  const currentOptions = fetchOptions ? asyncOptions || [] : options;

  const visibleOptions = currentOptions.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggle = (val: string) => {
    if (pendingSelected.includes(val)) {
      setPendingSelected(pendingSelected.filter((v) => v !== val));
    } else {
      setPendingSelected([...pendingSelected, val]);
    }
  };

  const handleSelectAll = () => {
    const visibleValues = visibleOptions.map((opt) => opt.value);
    const allVisibleSelected =
      visibleValues.length > 0 &&
      visibleValues.every((v) => pendingSelected.includes(v));
    if (allVisibleSelected) {
      setPendingSelected(
        pendingSelected.filter((v) => !visibleValues.includes(v))
      );
    } else {
      setPendingSelected(
        Array.from(new Set([...pendingSelected, ...visibleValues]))
      );
    }
  };

  const visibleValues = visibleOptions.map((opt) => opt.value);
  const isAllVisibleSelected =
    visibleValues.length > 0 &&
    visibleValues.every((v) => pendingSelected.includes(v));

  const handleOpenChange = async (open: boolean) => {
    setOpen(open);
    if (open) {
      setPendingSelected(value);
      setSearch("");
      if (fetchOptions && !fetchedRef.current) {
        setLoading(true);
        try {
          const data = await fetchOptions();
          setAsyncOptions(data);
          fetchedRef.current = true;
        } catch (e: unknown) {
          console.error(e);
          setAsyncOptions([]);
        } finally {
          setLoading(false);
        }
      }
    }
  };

  const handleApply = () => {
    onChange?.(pendingSelected);
    setOpen(false);
    setSearch("");
  };

  const handleCancel = () => {
    setPendingSelected([]);
    onChange?.([]);
    setSearch("");
    setOpen(false);
  };

  return (
    <>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <div className="inline-block relative">
            <Button variant="ghost" size="icon">
              {open ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
            {value && value.length > 0 && (
              <span className="top-1 right-1 absolute bg-blue border-2 border-white rounded-full w-2 h-2" />
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent className="flex flex-col gap-2 bg-white p-4 w-64">
          <div className="relative mb-2">
            <span className="top-1/2 left-3 absolute text-gray-400 -translate-y-1/2">
              <Search className="w-4 h-4" />
            </span>
            <Input
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-9 pl-9"
              disabled={loading}
            />
            {search && !loading && (
              <button
                type="button"
                className="top-1/2 right-3 absolute text-gray-400 hover:text-gray-600 -translate-y-1/2"
                onClick={() => setSearch("")}
                tabIndex={-1}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex flex-col gap-2 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
              </div>
            ) : visibleOptions.length === 0 ? (
              <span className="py-4 text-gray-400 text-center">
                No results found
              </span>
            ) : (
              <>
                {showSelectAll && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={isAllVisibleSelected}
                      onCheckedChange={handleSelectAll}
                    />
                    <span className="text-gray-700 text-base">Select All</span>
                  </label>
                )}
                {visibleOptions.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-2 cursor-pointer ${
                      showSelectAll ? "pl-6" : ""
                    }`}
                  >
                    <Checkbox
                      checked={pendingSelected.includes(opt.value)}
                      onCheckedChange={() => handleToggle(opt.value)}
                    />
                    <span className="text-gray-700 text-base">{opt.label}</span>
                  </label>
                ))}
              </>
            )}
          </div>
          <div className="flex items-center my-2">
            <div className="flex-1 border-gray-200 border-t" />
          </div>
          <div className="flex gap-2 mt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleCancel}
              disabled={loading}
            >
              Clear Filter
            </Button>
            <Button
              className="flex-1 bg-[#17479E] hover:bg-[#123a7c] text-white"
              onClick={handleApply}
              disabled={loading}
            >
              Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}
