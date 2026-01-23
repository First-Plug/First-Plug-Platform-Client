"use client";

import * as React from "react";
import { Wrench, Shield, ArrowLeftRight } from "lucide-react";
import { cn } from "@/shared";

interface ServiceType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
}

const serviceTypes: ServiceType[] = [
  {
    id: "it-support",
    name: "IT Support",
    description: "Technical assistance for your equipment",
    icon: <Wrench className="w-6 h-6" strokeWidth={2} />,
    enabled: true,
  },
  {
    id: "enrollment",
    name: "Enrollment",
    description: "Mobile Device Management for security and control",
    icon: <Shield className="w-6 h-6" strokeWidth={2} />,
    enabled: true,
  },
  {
    id: "buyback",
    name: "Buyback",
    description: "Sell your used equipment",
    icon: <ArrowLeftRight className="w-6 h-6" strokeWidth={2} />,
    enabled: true,
  },
];

interface StepServiceTypeSelectionProps {
  selectedServiceType: string | null;
  onServiceTypeSelect: (serviceType: string) => void;
}

export const StepServiceTypeSelection: React.FC<
  StepServiceTypeSelectionProps
> = ({ selectedServiceType, onServiceTypeSelect }) => {
  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-muted-foreground text-center">
        What type of service do you need?
      </p>

      <div className="gap-4 grid grid-cols-3 w-full max-w-2xl">
        {serviceTypes.map((serviceType) => (
          <button
            key={serviceType.id}
            type="button"
            onClick={() =>
              serviceType.enabled && onServiceTypeSelect(serviceType.id)
            }
            disabled={!serviceType.enabled}
            className={cn(
              "flex flex-col justify-center items-center gap-3 bg-white p-6 border-2 rounded-lg transition-all",
              selectedServiceType === serviceType.id
                ? "border-blue"
                : "border-gray-200 hover:border-blue",
              !serviceType.enabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <div
              className={cn(
                "flex justify-center items-center bg-blue/10 border border-blue/20 rounded-full w-16 h-16"
              )}
            >
              <div className="text-blue">{serviceType.icon}</div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="font-bold text-base">{serviceType.name}</span>
              <span className="text-dark-grey text-sm text-center">
                {serviceType.description}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
