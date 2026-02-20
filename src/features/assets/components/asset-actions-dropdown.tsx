"use client";

import { useRouter } from "next/navigation";
import {
  Wrench,
  ArrowLeftRight,
  Eraser,
  Shield,
  Sparkles,
  Gift,
  Trash2,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { useQuoteStore } from "@/features/quotes/store/quote.store";
import { cn } from "@/shared";

const ASSET_ACTIONS = [
  {
    id: "it-support",
    label: "IT Support",
    icon: Wrench,
    allowedCategories: undefined, // todos
  },
  {
    id: "buyback",
    label: "Buyback",
    icon: ArrowLeftRight,
    allowedCategories: undefined,
  },
  {
    id: "data-wipe",
    label: "Data Wipe",
    icon: Eraser,
    allowedCategories: ["Computer", "Other"],
  },
  {
    id: "enrollment",
    label: "Enrollment",
    icon: Shield,
    allowedCategories: ["Computer"],
  },
  {
    id: "cleaning",
    label: "Cleaning",
    icon: Sparkles,
    allowedCategories: ["Computer", "Other"],
  },
  {
    id: "donations",
    label: "Donate",
    icon: Gift,
    allowedCategories: undefined,
  },
  {
    id: "destruction-recycling",
    label: "Recycle",
    icon: Trash2,
    allowedCategories: undefined,
  },
] as const;

function isActionAllowedForCategory(
  action: (typeof ASSET_ACTIONS)[number],
  category: string
): boolean {
  if (!action.allowedCategories) return true;
  return action.allowedCategories.includes(category as any);
}

interface AssetActionsDropdownProps {
  category: string;
  productIds: string[];
  className?: string;
}

export function AssetActionsDropdown({
  category,
  productIds,
  className,
}: AssetActionsDropdownProps) {
  const router = useRouter();
  const setPresetServiceOpen = useQuoteStore((s) => s.setPresetServiceOpen);
  const setCurrentServiceType = useQuoteStore((s) => s.setCurrentServiceType);
  const setCurrentStep = useQuoteStore((s) => s.setCurrentStep);
  const setIsAddingService = useQuoteStore((s) => s.setIsAddingService);

  const allowedActions = ASSET_ACTIONS.filter((action) =>
    isActionAllowedForCategory(action, category)
  );

  if (productIds.length === 0 || allowedActions.length === 0) {
    return null;
  }

  const handleAction = (serviceType: string) => {
    // Preset para que el formulario abra directo en step 3 con este asset
    if (serviceType === "it-support") {
      setPresetServiceOpen({
        serviceType: "it-support",
        assetId: productIds[0],
      });
    } else {
      setPresetServiceOpen({
        serviceType,
        assetIds: productIds,
      });
    }
    // Saltar step 1 y 2: marcar tipo, step 3 y abrir el formulario antes de navegar
    setCurrentServiceType(serviceType);
    setCurrentStep(3);
    setIsAddingService(true);
    router.push("/home/quotes/new-request");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex justify-center items-center w-8 h-8 rounded-md hover:bg-grey/20 text-dark-grey hover:text-black transition-colors",
            className
          )}
          aria-label="Acciones sobre el producto"
        >
          <MoreVertical className="w-5 h-5" strokeWidth={2} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[180px] bg-white">
        {allowedActions.map((action) => {
          const Icon = action.icon;
          return (
            <DropdownMenuItem
              key={action.id}
              onClick={() => handleAction(action.id)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Icon className="w-4 h-4" strokeWidth={2} />
              {action.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
