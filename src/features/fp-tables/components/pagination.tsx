import React from "react";
import { Button } from "@/shared/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

interface PaginationAdvancedProps {
  pageIndex: number;
  pageCount: number;
  setPageIndex: (pageIndex: number) => void;
  pageSize: number;
  setPageSize: (pageSize: number) => void;
}

export function PaginationAdvanced({
  pageIndex,
  pageCount,
  setPageIndex,
  pageSize,
  setPageSize,
}: PaginationAdvancedProps) {
  const generatePageNumbers = () => {
    const pages = [];

    // Always show first page
    pages.push(
      <PageButton
        key={1}
        page={1}
        isActive={pageIndex === 0}
        setPageIndex={setPageIndex}
      />
    );

    // Logic for starting ellipsis
    if (pageIndex > 2) {
      pages.push(<Ellipsis key="start-ellipsis" />);
    }

    // Calculate middle pages
    const start = Math.max(2, pageIndex);
    const end = Math.min(pageCount - 1, pageIndex + 2);

    for (let i = start; i <= end; i++) {
      pages.push(
        <PageButton
          key={i}
          page={i}
          isActive={pageIndex === i - 1}
          setPageIndex={setPageIndex}
        />
      );
    }

    // Logic for ending ellipsis
    if (pageIndex < pageCount - 3) {
      pages.push(<Ellipsis key="end-ellipsis" />);
    }

    // Always show last page if more than 1 page
    if (pageCount > 1) {
      pages.push(
        <PageButton
          key={pageCount}
          page={pageCount}
          isActive={pageIndex === pageCount - 1}
          setPageIndex={setPageIndex}
        />
      );
    }

    return pages;
  };

  return (
    <div className="flex md:flex-row flex-col justify-between items-center gap-4 w-full">
      <div className="flex-1" />
      <div className="flex justify-center items-center gap-4">
        <Button
          onClick={() => setPageIndex(pageIndex - 1)}
          disabled={pageIndex === 0}
        >
          <ArrowLeft className="w-5" />
        </Button>

        <div className="flex gap-2">{generatePageNumbers()}</div>

        <Button
          onClick={() => setPageIndex(pageIndex + 1)}
          disabled={pageIndex === pageCount - 1}
        >
          <ArrowRight className="w-5" />
        </Button>
      </div>
      <div className="flex flex-1 justify-end">
        {/* Page Size Selector */}
        <div className="flex items-center gap-4">
          <Select
            value={String(pageSize)}
            onValueChange={(value) => setPageSize(Number(value))}
          >
            <SelectTrigger className="w-32">
              <SelectValue>{`Size: ${String(pageSize)}`}</SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-white">
              {[10, 20, 50].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  Show {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

const PageButton = ({
  page,
  isActive,
  setPageIndex,
}: {
  page: number;
  isActive: boolean;
  setPageIndex: (pageIndex: number) => void;
}) => (
  <Button
    onClick={() => setPageIndex(page - 1)}
    className={`border rounded-full w-10 h-10 grid place-items-center transition-all duration-300 ${
      isActive ? "bg-blue/80 text-white" : "bg-white text-black"
    }`}
  >
    {page}
  </Button>
);

const Ellipsis = () => <span className="px-2">...</span>;
