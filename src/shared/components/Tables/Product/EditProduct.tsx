"use client";

import {
  Button,
  PenIcon,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared";

import { Product, ProductTable } from "@/features/assets";

import { useQueryClient } from "@tanstack/react-query";
import { useAsideStore } from "@/shared";
import { TooltipArrow } from "@radix-ui/react-tooltip";

export default function EditProduct({
  product,
  disabled,
}: {
  product: Product;
  disabled?: boolean;
}) {
  const { setAside } = useAsideStore();
  const queryClient = useQueryClient();

  const handleEditProduct = () => {
    const cachedAssets = queryClient.getQueryData<ProductTable[]>(["assets"]);

    let cachedProduct: Product | undefined;
    if (cachedAssets) {
      cachedAssets.some((group) => {
        cachedProduct = group.products.find((p) => p._id === product._id);
        return Boolean(cachedProduct);
      });
    }

    if (cachedProduct) {
      queryClient.setQueryData(["selectedProduct"], cachedProduct);
      setAside("EditProduct");
    } else {
      console.error(
        "Producto no encontrado en caché; el aside mostrará un loader."
      );
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <Button
              variant="outline"
              onClick={handleEditProduct}
              disabled={disabled}
            >
              <PenIcon
                className={`w-4 ${
                  disabled ? "text-gray-400" : "text-blue hover:text-blue/70"
                }`}
                strokeWidth={2}
              />
            </Button>
          </div>
        </TooltipTrigger>
        {disabled && (
          <TooltipContent
            side="bottom"
            align="end"
            className="z-50 bg-blue/80 p-2 rounded-md font-normal text-white text-xs"
          >
            Products involved in a shipment that&apos;s &quot;On the way&quot;
            cannot be edited.
            <TooltipArrow className="fill-blue/80" />
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
