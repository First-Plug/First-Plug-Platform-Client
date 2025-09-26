"use client";
import { Button } from "@/shared";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared";

interface CreateProductConfirmationProps {
  formData: any;
  onConfirm: () => void;
  onCancel: () => void;
}

export const CreateProductConfirmation = ({
  formData,
  onConfirm,
  onCancel,
}: CreateProductConfirmationProps) => {
  return (
    <Dialog open={true}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-xl">Create products</DialogTitle>
          <DialogDescription className="font-normal text-md">
            Are you sure you want to create {formData.quantity} product(s) for{" "}
            {formData.tenant?.name} in the warehouse {formData.warehouse?.name}?
          </DialogDescription>
        </DialogHeader>
        <DialogDescription className="text-md">
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={onCancel} className="w-full">
              <p>Cancel</p>
            </Button>
            <Button variant="primary" className="w-full" onClick={onConfirm}>
              <p>Create</p>
            </Button>
          </div>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};
