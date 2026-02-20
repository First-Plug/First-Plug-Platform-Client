"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/shared/utils/utils";

interface AssetFilterFieldProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  onClear?: () => void;
  hasValue: boolean;
  /** Si true, el campo actúa como trigger (ej. popover). Si false, es un input. */
  asTrigger?: boolean;
}

/** Wrapper compartido para filtros: mismo estilo visual y X dentro del campo */
export const AssetFilterField = React.forwardRef<
  HTMLDivElement,
  AssetFilterFieldProps
>(function AssetFilterField(
  { children, onClear, hasValue, asTrigger = false, className, ...rest },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn(
        "relative flex items-center bg-white border border-gray-300 rounded-md w-[200px] h-9 overflow-hidden",
        "hover:bg-gray-50 transition-colors",
        asTrigger && "cursor-pointer",
        className
      )}
      {...rest}
    >
      <div
        className={cn(
          "flex-1 min-w-0 h-full flex items-center px-3",
          hasValue && onClear ? "pr-8" : "pr-3"
        )}
      >
        {children}
      </div>
      {hasValue && onClear && (
        <button
          type="button"
          className="absolute right-1 top-1/2 -translate-y-1/2 flex justify-center items-center hover:bg-gray-100 rounded w-6 h-6 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onClear();
          }}
          title="Clear filter"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>
      )}
    </div>
  );
});
