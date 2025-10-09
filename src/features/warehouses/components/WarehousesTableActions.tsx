"use client";

import { Button, PenIcon, TrashIcon, useAsideStore } from "@/shared";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { WarehouseDetails } from "../interfaces/warehouse.interface";

interface WarehousesTableActionsProps {
  warehouse: WarehouseDetails;
  onDeleteWarehouse?: (id: string) => void | Promise<void>;
}

export function WarehousesTableActions({
  warehouse,
}: WarehousesTableActionsProps) {
  const { setAside } = useAsideStore();
  const queryClient = useQueryClient();

  const handleUpdateWarehouse = () => {
    // Inserción optimista en cache para carga instantánea
    queryClient.setQueryData(["selectedWarehouse"], warehouse);
    setAside("UpdateWarehouse");
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        className="m-0 p-0 min-w-0"
        variant="outline"
        size="small"
        icon={<PenIcon className="w-5 h-5 text-blue" strokeWidth={2} />}
        onClick={handleUpdateWarehouse}
      />
    </div>
  );
}
