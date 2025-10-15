"use client";

import { Office } from "../types/settings.types";
import {
  Button,
  PenIcon,
  TrashIcon,
  DeleteAction,
  useAsideStore,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared";
import { MapPin, Mail, Phone, Building, Star } from "lucide-react";
import { countriesByCode } from "@/shared/constants/country-codes";
import { useQueryClient } from "@tanstack/react-query";

interface OfficeCardProps {
  office: Office;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
  isDeleting?: boolean;
  isSettingDefault?: boolean;
  canDelete?: boolean;
}

export const OfficeCard = ({
  office,
  onDelete,
  onSetDefault,
  isDeleting = false,
  isSettingDefault = false,
  canDelete = true,
}: OfficeCardProps) => {
  const { setAside, pushAside } = useAsideStore();
  const queryClient = useQueryClient();

  const handleEdit = () => {
    queryClient.setQueryData(["selectedOffice"], office);
    pushAside("UpdateOffice");
  };

  const handleSetDefault = () => {
    if (isOfficeIncomplete()) {
      return;
    }

    if (!office.isDefault) {
      onSetDefault(office._id);
    }
  };
  const getCountryName = (countryCode?: string) => {
    if (!countryCode) return "";
    return countriesByCode[countryCode] || countryCode;
  };

  const isOfficeIncomplete = () => {
    const requiredFields = [
      "name",
      "phone",
      "country",
      "state",
      "city",
      "zipCode",
      "address",
    ];
    return requiredFields.some((field) => {
      const value = office[field as keyof Office];
      return !value || (typeof value === "string" && value.trim() === "");
    });
  };

  const formatAddress = () => {
    const parts = [];
    if (office.address) parts.push(office.address);
    if (office.apartment) parts.push(office.apartment);
    if (office.city) parts.push(office.city);
    if (office.state) parts.push(office.state);
    if (office.zipCode) parts.push(office.zipCode);
    if (office.country) parts.push(getCountryName(office.country));

    return parts.join(", ");
  };

  return (
    <div
      className={`${
        isOfficeIncomplete()
          ? "bg-red-50 border-red-200"
          : "bg-white border-gray-200"
      } hover:shadow-md p-6 border rounded-lg transition-shadow duration-200`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <Building className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900 text-lg">{office.name}</h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Estrella para marcar oficina por defecto */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Button
                    variant="outline"
                    onClick={handleSetDefault}
                    disabled={
                      isSettingDefault ||
                      office.isDefault ||
                      isOfficeIncomplete()
                    }
                    className={`p-2 ${
                      office.isDefault || isOfficeIncomplete()
                        ? "hover:bg-yellow-50 cursor-not-allowed"
                        : "hover:bg-yellow-50 cursor-pointer"
                    }`}
                  >
                    <Star
                      className={`w-4 h-4 ${
                        office.isDefault
                          ? "fill-yellow-400 text-yellow-400"
                          : isOfficeIncomplete()
                          ? "text-gray-300"
                          : "text-gray-400 hover:text-yellow-400"
                      }`}
                      strokeWidth={2}
                    />
                  </Button>
                </div>
              </TooltipTrigger>
              {(office.isDefault || isOfficeIncomplete()) && (
                <TooltipContent className="bg-white">
                  <p>
                    {office.isDefault
                      ? "This office is already set as default."
                      : "Cannot set as default. Office has incomplete required data."}
                  </p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>

          <Button variant="outline" onClick={handleEdit} className="p-2">
            <PenIcon
              className="w-4 h-4 text-blue hover:text-blue/70"
              strokeWidth={2}
            />
          </Button>
          {canDelete && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <DeleteAction
                      type="office"
                      id={office._id}
                      onConfirm={() => onDelete(office._id)}
                      disabled={
                        isDeleting ||
                        office.isDefault ||
                        office.hasAssignedProducts === true ||
                        office.hasActiveShipments === true
                      }
                      trigger={
                        <Button
                          variant="outline"
                          disabled={
                            isDeleting ||
                            office.isDefault ||
                            office.hasAssignedProducts === true ||
                            office.hasActiveShipments === true
                          }
                          className="hover:bg-red-50 p-2"
                        >
                          <TrashIcon
                            className={`w-4 h-4 ${
                              office.isDefault ||
                              office.hasAssignedProducts === true ||
                              office.hasActiveShipments === true
                                ? "text-gray-400"
                                : "text-red-600 hover:text-red-700"
                            }`}
                            strokeWidth={2}
                          />
                        </Button>
                      }
                    />
                  </div>
                </TooltipTrigger>
                {(office.hasAssignedProducts === true ||
                  office.hasActiveShipments === true ||
                  office.isDefault) && (
                  <TooltipContent className="bg-white">
                    <p>
                      {office.isDefault
                        ? "Default office cannot be deleted."
                        : "Offices with assigned products or active shipments cannot be deleted."}
                    </p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>

      {isOfficeIncomplete() && (
        <div className="mb-3">
          <span className="inline-flex items-center bg-red-100 px-2.5 py-0.5 rounded-full font-medium text-red-800 text-xs">
            <svg
              className="mr-1 w-3 h-3"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            Incomplete Data
          </span>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <MapPin className="flex-shrink-0 mt-0.5 w-4 h-4 text-gray-500" />
          <div className="text-gray-600 text-sm">
            {office.city && office.country ? (
              <>
                <div className="font-medium">
                  {office.city}, {getCountryName(office.country)}
                </div>
                {formatAddress() && (
                  <div className="mt-1 text-gray-500">{formatAddress()}</div>
                )}
              </>
            ) : (
              <span className="text-gray-400">No location specified</span>
            )}
          </div>
        </div>

        {office.email && (
          <div className="flex items-center gap-3">
            <Mail className="flex-shrink-0 w-4 h-4 text-gray-500" />
            <span className="text-gray-600 text-sm">{office.email}</span>
          </div>
        )}

        {/* Teléfono */}
        {office.phone && (
          <div className="flex items-center gap-3">
            <Phone className="flex-shrink-0 w-4 h-4 text-gray-500" />
            <span className="text-gray-600 text-sm">{office.phone}</span>
          </div>
        )}
      </div>

      {!office.email && !office.phone && !office.city && (
        <div className="text-gray-400 text-sm italic">
          No contact information available
        </div>
      )}
    </div>
  );
};
