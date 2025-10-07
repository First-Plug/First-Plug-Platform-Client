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
import { Warehouse } from "../interfaces/warehouse.interface";

interface WarehousesTableActionsProps {
  warehouse: Warehouse;
  onDeleteWarehouse?: (id: string) => void | Promise<void>;
}

export function WarehousesTableActions({
  warehouse,
  onDeleteWarehouse,
}: WarehousesTableActionsProps) {
  const { setAside } = useAsideStore();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const canDelete = warehouse.totalProducts === 0;

  const deleteWarehouse = async () => {
    try {
      if (onDeleteWarehouse) await onDeleteWarehouse(warehouse.id);
    } finally {
      setOpen(false);
    }
  };

  const handleUpdateWarehouse = () => {
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

      <>
        <Button
          className="m-0 p-0 min-w-0"
          variant="outline"
          size="small"
          disabled={!canDelete}
          icon={
            <TrashIcon
              className={`w-5 h-5 ${
                canDelete ? "text-[#B73232]" : "text-gray-400"
              }`}
              strokeWidth={2}
            />
          }
          onClick={() => canDelete && setOpen(true)}
        />

        <Dialog open={open}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-xl">Delete warehouse</DialogTitle>
              <DialogDescription className="font-normal text-md">
                {canDelete
                  ? "Are you sure you want to delete this warehouse? This action cannot be undone."
                  : `Cannot delete warehouse "${warehouse.name}" because it contains ${warehouse.totalProducts} products. Please remove all products before deleting the warehouse.`}
              </DialogDescription>
            </DialogHeader>
            <DialogDescription className="text-md">
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setOpen(false)}
                  className="w-full"
                >
                  <p>{canDelete ? "Cancel" : "Close"}</p>
                </Button>
                {canDelete && (
                  <Button
                    variant="delete"
                    className="bg-error w-full"
                    onClick={deleteWarehouse}
                  >
                    <p>Delete</p>
                  </Button>
                )}
              </div>
            </DialogDescription>
          </DialogContent>
        </Dialog>
      </>
    </div>
  );
}
