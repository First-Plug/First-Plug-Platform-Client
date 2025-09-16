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
    <div className="flex">
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
          icon={
            <TrashIcon className="w-5 h-5 text-[#B73232]" strokeWidth={2} />
          }
          onClick={() => setOpen(true)}
        />

        <Dialog open={open}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-xl">Delete warehouse</DialogTitle>
              <DialogDescription className="font-normal text-md">
                Are you sure you want to delete this warehouse? This action
                cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogDescription className="text-md">
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setOpen(false)}
                  className="w-full"
                >
                  <p>Cancel</p>
                </Button>
                <Button
                  variant="delete"
                  className="bg-error w-full"
                  onClick={deleteWarehouse}
                >
                  <p>Delete</p>
                </Button>
              </div>
            </DialogDescription>
          </DialogContent>
        </Dialog>
      </>
    </div>
  );
}
