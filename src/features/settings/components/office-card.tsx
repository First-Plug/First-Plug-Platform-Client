"use client";

import { Office } from "../types/settings.types";
import {
  Button,
  PenIcon,
  TrashIcon,
  DeleteAction,
  useAsideStore,
} from "@/shared";
import { MapPin, Mail, Phone, Building } from "lucide-react";
import { countriesByCode } from "@/shared/constants/country-codes";
import { useQueryClient } from "@tanstack/react-query";

interface OfficeCardProps {
  office: Office;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
  canDelete?: boolean;
}

export const OfficeCard = ({
  office,
  onDelete,
  isDeleting = false,
  canDelete = true,
}: OfficeCardProps) => {
  const { setAside, pushAside } = useAsideStore();
  const queryClient = useQueryClient();

  const handleEdit = () => {
    queryClient.setQueryData(["selectedOffice"], office);
    pushAside("UpdateOffice");
  };
  const getCountryName = (countryCode?: string) => {
    if (!countryCode) return "";
    return countriesByCode[countryCode] || countryCode;
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
    <div className="bg-white hover:shadow-md p-6 border border-gray-200 rounded-lg transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <Building className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900 text-lg">{office.name}</h3>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleEdit} className="p-2">
            <PenIcon
              className="w-4 h-4 text-blue hover:text-blue/70"
              strokeWidth={2}
            />
          </Button>
          {canDelete && (
            <DeleteAction
              type="office"
              id={office._id}
              onConfirm={() => onDelete(office._id)}
              trigger={
                <Button
                  variant="outline"
                  disabled={isDeleting}
                  className="hover:bg-red-50 p-2"
                >
                  <TrashIcon
                    className="w-4 h-4 text-red-600 hover:text-red-700"
                    strokeWidth={2}
                  />
                </Button>
              }
            />
          )}
        </div>
      </div>

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
