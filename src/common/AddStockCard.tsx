"use client";
import { IconX, FileIcon, AlertCheck } from "./Icons";

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
      <header className="flex items-start justify-between">
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
        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-4">
          <div className="bg-green h-1.5 rounded-full transition-all duration-300 ease-in-out"></div>
        </div>
      ) : (
        <footer className="flex flex-col items-end flex-1">
          <p className="text-grey flex gap-2 items-center text-md">
            {currentDate}
            <AlertCheck className="text-green" />
          </p>
        </footer>
      )}
    </article>
  );
}
