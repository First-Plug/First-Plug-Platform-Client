"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/shared";
import { InputProductForm, DropdownInputProductForm } from "@/features/assets";
import { useAsideStore, useAlertStore } from "@/shared";
import {
  LogisticOrder,
  ShipmentStatus,
  ShipmentType,
} from "../interfaces/logistics";
import { useUpdateLogisticsShipment } from "../hooks/useUpdateLogisticsShipment";

// Schema de validación para el formulario
const editLogisticsShipmentSchema = z.object({
  shipmentStatus: z.enum([
    "On Hold - Missing Data",
    "Received",
    "Cancelled",
    "On The Way",
    "In Preparation",
  ]),
  price: z.object({
    amount: z.string().min(1, "Amount is required"),
    currency: z.string().min(1, "Currency is required"),
  }),
  shipmentType: z.enum(["Courrier", "Internal", "TBC"]),
  trackingURL: z
    .string()
    .url("Invalid tracking URL")
    .optional()
    .or(z.literal("")),
});

type EditLogisticsShipmentFormData = z.infer<
  typeof editLogisticsShipmentSchema
>;

const SHIPMENT_STATUS_OPTIONS: ShipmentStatus[] = [
  "On Hold - Missing Data",
  "Received",
  "Cancelled",
  "On The Way",
  "In Preparation",
];

const SHIPMENT_TYPE_OPTIONS: ShipmentType[] = ["Courrier", "Internal", "TBC"];

const CURRENCY_OPTIONS = [
  "USD",
  "EUR",
  "GBP",
  "ARS",
  "BRL",
  "CLP",
  "COP",
  "MXN",
  "PEN",
];

export const EditLogisticsShipmentAside = () => {
  const { setAside } = useAsideStore();
  const { setAlert } = useAlertStore();
  const queryClient = useQueryClient();

  // Obtener el envío seleccionado del caché
  const selectedShipment = queryClient.getQueryData<LogisticOrder>([
    "selectedLogisticsShipment",
  ]);
  const updateShipmentMutation = useUpdateLogisticsShipment();

  const methods = useForm<EditLogisticsShipmentFormData>({
    resolver: zodResolver(editLogisticsShipmentSchema),
    defaultValues: {
      shipmentStatus: selectedShipment?.shipmentStatus || "In Preparation",
      price: {
        amount: selectedShipment?.price
          ? selectedShipment.price.split(" ")[0]
          : "",
        currency: selectedShipment?.price
          ? selectedShipment.price.split(" ")[1]?.replace(/[^A-Z]/g, "") ||
            "USD"
          : "USD",
      },
      shipmentType: selectedShipment?.shipmentType || "Internal",
      trackingURL: selectedShipment?.trackingURL || "",
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting, errors, isDirty },
    watch,
    setValue,
  } = methods;

  const isUpdating = updateShipmentMutation.isPending;

  const contentRef = useRef<HTMLDivElement>(null);
  const [needsPadding, setNeedsPadding] = useState(false);

  useEffect(() => {
    const checkForScroll = () => {
      if (contentRef.current) {
        const element = contentRef.current;
        const hasScroll = element.scrollHeight > element.clientHeight;
        setNeedsPadding(hasScroll);
      }
    };

    checkForScroll();
    window.addEventListener("resize", checkForScroll);

    return () => window.removeEventListener("resize", checkForScroll);
  }, []);

  const closeAside = () => {
    setAside(undefined);
    queryClient.removeQueries({ queryKey: ["selectedLogisticsShipment"] });
  };

  const onSubmit = async (data: EditLogisticsShipmentFormData) => {
    try {
      await updateShipmentMutation.mutateAsync({
        shipmentId: selectedShipment.orderId,
        data: {
          shipmentStatus: data.shipmentStatus,
          price: {
            amount: data.price.amount || "",
            currency: data.price.currency || "USD",
          },
          shipmentType: data.shipmentType,
          trackingURL: data.trackingURL,
        },
      });

      setAlert("dataUpdatedSuccessfully");
      closeAside();
    } catch (error) {
      console.error("Error al actualizar el envío:", error);
      setAlert("errorUpdateTeam");
    }
  };

  if (!selectedShipment) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-gray-500">Selected shipment not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div
        ref={contentRef}
        className={`flex-1 overflow-y-auto scrollbar-custom ${
          needsPadding ? "pb-20" : ""
        }`}
      >
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Shipment Identifier (read-only) */}
            <div className="mb-4">
              <p className="mb-2 text-gray-600 text-sm">Shipment Identifier</p>
              <p className="font-medium text-gray-900 text-lg">
                {selectedShipment.orderId} - {selectedShipment.tenant}
              </p>
            </div>

            {/* Shipment Status */}
            <div>
              <DropdownInputProductForm
                title="Shipment Status"
                placeholder="Select status"
                options={SHIPMENT_STATUS_OPTIONS}
                selectedOption={watch("shipmentStatus")}
                onChange={(value) => {
                  setValue("shipmentStatus", value as ShipmentStatus, {
                    shouldDirty: true,
                  });
                }}
                name="shipmentStatus"
                searchable={false}
              />
              {errors.shipmentStatus && (
                <p className="mt-1 text-red-500 text-sm">
                  {errors.shipmentStatus.message}
                </p>
              )}
            </div>

            {/* Price */}
            <div>
              <h3 className="mb-4 font-semibold text-black text-lg">Price</h3>
              <div className="gap-4 grid grid-cols-2">
                <div>
                  <InputProductForm
                    title="Amount"
                    placeholder="Enter amount"
                    type="text"
                    value={watch("price.amount")}
                    onChange={(e) => {
                      setValue("price.amount", e.target.value, {
                        shouldDirty: true,
                      });
                    }}
                    name="price.amount"
                  />
                  {errors.price?.amount && (
                    <p className="mt-1 text-red-500 text-sm">
                      {errors.price.amount.message}
                    </p>
                  )}
                </div>
                <div>
                  <DropdownInputProductForm
                    title="Currency"
                    placeholder="Select currency"
                    options={CURRENCY_OPTIONS}
                    selectedOption={watch("price.currency")}
                    onChange={(value) => {
                      setValue("price.currency", value, { shouldDirty: true });
                    }}
                    name="price.currency"
                    searchable={false}
                  />
                  {errors.price?.currency && (
                    <p className="mt-1 text-red-500 text-sm">
                      {errors.price.currency.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Shipment Type */}
            <div>
              <DropdownInputProductForm
                title="Shipment Type"
                placeholder="Select type"
                options={SHIPMENT_TYPE_OPTIONS}
                selectedOption={watch("shipmentType")}
                onChange={(value) => {
                  setValue("shipmentType", value as ShipmentType, {
                    shouldDirty: true,
                  });
                }}
                name="shipmentType"
                searchable={false}
              />
              {errors.shipmentType && (
                <p className="mt-1 text-red-500 text-sm">
                  {errors.shipmentType.message}
                </p>
              )}
            </div>

            {/* Tracking URL */}
            <div>
              <InputProductForm
                title="Tracking URL"
                placeholder="https://tracking.example.com/123"
                type="url"
                value={watch("trackingURL")}
                onChange={(e) => {
                  setValue("trackingURL", e.target.value, {
                    shouldDirty: true,
                  });
                }}
                name="trackingURL"
              />
              {errors.trackingURL && (
                <p className="mt-1 text-red-500 text-sm">
                  {errors.trackingURL.message}
                </p>
              )}
            </div>
          </form>
        </FormProvider>
      </div>

      {/* Action buttons */}
      <aside className="bottom-0 left-0 absolute bg-slate-50 py-2 border-t w-full">
        <div className="flex justify-end gap-2 mx-auto py-2 w-5/6">
          <Button
            variant="primary"
            className="px-8"
            onClick={handleSubmit(onSubmit)}
            disabled={isUpdating || !isDirty}
          >
            {isUpdating ? "Saving..." : "Save"}
          </Button>
        </div>
      </aside>
    </div>
  );
};
