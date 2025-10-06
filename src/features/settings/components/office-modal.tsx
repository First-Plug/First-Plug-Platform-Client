"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Button, LoaderSpinner, Form } from "@/shared";
import { OfficeForm } from "./office-form";
import {
  createOfficeSchema,
  type OfficeFormData,
} from "../schemas/office.schema";
import { Office, CreateOffice, UpdateOffice } from "../types/settings.types";

interface OfficeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateOffice | UpdateOffice) => void;
  office?: Office | null;
  isLoading?: boolean;
  existingOffices?: Office[];
}

export const OfficeModal = ({
  isOpen,
  onClose,
  onSubmit,
  office,
  isLoading = false,
  existingOffices = [],
}: OfficeModalProps) => {
  // Crear el esquema con validación de nombres únicos
  const schema = createOfficeSchema(existingOffices, office?._id);

  const form = useForm<OfficeFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      country: "",
      city: "",
      state: "",
      zipCode: "",
      address: "",
      apartment: "",
      additionalInfo: "",
    },
  });

  useEffect(() => {
    if (office) {
      form.reset({
        name: office.name || "",
        email: office.email || "",
        phone: office.phone || "",
        country: office.country || "",
        city: office.city || "",
        state: office.state || "",
        zipCode: office.zipCode || "",
        address: office.address || "",
        apartment: office.apartment || "",
        additionalInfo: office.additionalInfo || "",
      });
    } else {
      form.reset({
        name: "",
        email: "",
        phone: "",
        country: "",
        city: "",
        state: "",
        zipCode: "",
        address: "",
        apartment: "",
        additionalInfo: "",
      });
    }
  }, [office, form, isOpen]);

  const handleSubmit = (data: OfficeFormData) => {
    // Procesar datos para enviar solo los campos no vacíos
    const processedData = Object.fromEntries(
      Object.entries(data).map(([key, value]) => {
        // Convertir valores null/undefined a string vacío y luego filtrar vacíos
        return [key, value ?? ""];
      })
    );

    // Si estamos editando, incluir el ID
    if (office) {
      onSubmit({ ...processedData, id: office._id } as UpdateOffice & {
        id: string;
      });
    } else {
      onSubmit(processedData as unknown as CreateOffice);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 p-4">
      <div className="bg-white shadow-xl rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-gray-200 border-b">
          <div>
            <h2 className="font-semibold text-gray-900 text-xl">
              {office ? "Edit Office" : "Add New Office"}
            </h2>
            <p className="mt-1 text-gray-600 text-sm">
              {office
                ? "Update the office information below."
                : "Enter the details for the new office location."}
            </p>
          </div>
          <Button
            variant="text"
            size="small"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </Button>
        </div>

        {/* Form */}
        <div className="p-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              <OfficeForm form={form} isEditMode={!!office} />

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-gray-200 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isLoading || !form.formState.isDirty}
                  className="w-32"
                >
                  {isLoading ? (
                    <LoaderSpinner />
                  ) : office ? (
                    "Update Office"
                  ) : (
                    "Create Office"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};
