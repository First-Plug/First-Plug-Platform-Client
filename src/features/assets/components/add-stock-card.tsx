"use client";
import { IconX, FileIcon, AlertCheck } from "@/shared";

interface AddStockCardProps {
  title: string;
  file: string;
  currentDate: string;
  isLoading: boolean;
  className?: string;
  onDeleteClick?: () => void;
}

export function AddStockCard({
  title,
  file,
  currentDate,
  className,
  onDeleteClick,
  isLoading,
}: AddStockCardProps) {
  return (
    <article
      className={`flex flex-col ${
        className || ""
      } bg-white p-4 rounded-md border `}
    >
      <header className="flex justify-between items-start">
        <div className="flex">
          <div className="flex gap-2">
            <FileIcon />
            <div className="flex-col">
              <h2 className="font-bold text-black">{title}</h2>
              <p className="text-grey text-sm">{file}</p>
            </div>
          </div>
        </div>
        <button
          className="bg-transparent border-none cursor-pointer"
          onClick={onDeleteClick}
        >
          <IconX />
        </button>
      </header>
      {isLoading ? (
        <div className="bg-gray-200 mt-4 rounded-full w-full h-1.5">
          <div className="bg-green rounded-full h-1.5 transition-all duration-300 ease-in-out"></div>
        </div>
      ) : (
        <footer className="flex flex-col flex-1 items-end">
          <p className="flex items-center gap-2 text-grey text-md">
            {currentDate}
            <AlertCheck className="text-green" />
          </p>
        </footer>
      )}
    </article>
  );
}
