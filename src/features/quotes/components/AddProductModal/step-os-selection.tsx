"use client";

import * as React from "react";
import { Terminal, Check } from "lucide-react";
import { cn } from "@/shared";

// Custom icons for operating systems (not all available in lucide-react)
const MacOSIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
  </svg>
);

const WindowsIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M3 12V6.75l6-1.32v6.48L3 12zm17-9v8.75l-10 .15V5.21L20 3zM3 13l6 .09v6.81l-6-1.15V13zm17 .25V22L10 20.89v-7.64l10 1.75z" />
  </svg>
);

const LinuxIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
    <path d="M7 8h.01M12 8h.01M17 8h.01M7 12h.01M12 12h.01M17 12h.01" />
  </svg>
);

interface OperatingSystem {
  id: string;
  name: string;
  icon: React.ReactNode;
}

const operatingSystems: OperatingSystem[] = [
  {
    id: "macos",
    name: "macOS",
    icon: <MacOSIcon className="w-8 h-8" />,
  },
  {
    id: "windows",
    name: "Windows",
    icon: <WindowsIcon className="w-8 h-8" />,
  },
  {
    id: "linux",
    name: "Linux",
    icon: <LinuxIcon className="w-8 h-8" />,
  },
];

interface StepOSSelectionProps {
  selectedOS: string | null;
  onOSSelect: (os: string) => void;
  onSkip: () => void;
}

export const StepOSSelection: React.FC<StepOSSelectionProps> = ({
  selectedOS,
  onOSSelect,
  onSkip,
}) => {
  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-muted-foreground text-center">
        Select the operating system for your computer
      </p>

      <div className="flex justify-center gap-4">
        {operatingSystems.map((os) => (
          <button
            key={os.id}
            type="button"
            onClick={() => onOSSelect(os.id)}
            className={cn(
              "relative flex flex-col justify-center items-center gap-3 shadow-sm p-6 border-2 rounded-lg min-w-[160px] transition-all",
              selectedOS === os.id
                ? "border-blue bg-blue-50 shadow-md scale-105"
                : "border-gray-200 hover:border-blue hover:shadow-md"
            )}
          >
            <div
              className={cn(
                "flex justify-center items-center rounded-full w-16 h-16 transition-all",
                selectedOS === os.id ? "bg-blue/10  scale-110" : "bg-gray-100"
              )}
            >
              {os.icon}
            </div>
            <span
              className={cn(
                "font-semibold text-sm transition-colors",
                selectedOS === os.id ? "text-blue-600" : "text-gray-700"
              )}
            >
              {os.name}
            </span>
            {selectedOS === os.id && (
              <div className="top-2 right-2 absolute flex justify-center items-center bg-blue-500 rounded-full w-6 h-6">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={onSkip}
          className="text-blue-600 hover:text-blue-700 text-sm underline"
        >
          Skip this step
        </button>
      </div>
    </div>
  );
};
