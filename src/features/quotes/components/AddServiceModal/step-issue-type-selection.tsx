"use client";

import * as React from "react";
import { cn } from "@/shared";
import { Check } from "lucide-react";

interface IssueType {
  id: string;
  label: string;
}

const issueTypes: IssueType[] = [
  { id: "software-issue", label: "Software issue" },
  { id: "connectivity-network", label: "Connectivity / network" },
  { id: "account-access", label: "Account / access issue" },
  { id: "performance", label: "Performance issues" },
  { id: "damage-accident", label: "Damage / accident" },
  { id: "other", label: "Other" },
];

interface StepIssueTypeSelectionProps {
  selectedIssueTypes: string[];
  onIssueTypeToggle: (issueTypeId: string) => void;
}

export const StepIssueTypeSelection: React.FC<StepIssueTypeSelectionProps> = ({
  selectedIssueTypes,
  onIssueTypeToggle,
}) => {
  return (
    <div className="flex flex-col gap-6 w-full">
      <p className="text-muted-foreground text-center">
        What issues are you experiencing with this asset?
      </p>

      <div className="flex flex-col gap-3">
        {issueTypes.map((issueType) => {
          const isSelected = selectedIssueTypes.includes(issueType.id);

          return (
            <button
              key={issueType.id}
              type="button"
              onClick={() => onIssueTypeToggle(issueType.id)}
              className={cn(
                "flex items-center gap-3 bg-white p-4 border-2 rounded-lg text-left transition-all",
                isSelected
                  ? "border-blue bg-blue/5"
                  : "border-gray-200 hover:border-blue"
              )}
            >
              {/* Checkbox */}
              <div
                className={cn(
                  "flex flex-shrink-0 justify-center items-center border-2 rounded w-5 h-5",
                  isSelected
                    ? "bg-blue border-blue"
                    : "bg-white border-gray-300"
                )}
              >
                {isSelected && (
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                )}
              </div>

              {/* Label */}
              <span className="font-medium text-base">{issueType.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
