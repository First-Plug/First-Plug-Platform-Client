"use client";

import * as React from "react";
import { format, startOfToday } from "date-fns";
import { CalendarIcon, ChevronDown, ChevronRight } from "lucide-react";
import { Label } from "@/shared/components/ui/label";
import { Button } from "@/shared/components/ui/button";
import { Calendar } from "@/shared/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { cn } from "@/shared";
import { useGetTableAssets, Product, ProductTable } from "@/features/assets";
import { useFetchMembers } from "@/features/members";
import { useOffices } from "@/features/settings";
import SelectDropdownOptions from "@/shared/components/select-dropdown-options";
import { CountryFlag, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared";
import { countriesByCode } from "@/shared/constants/country-codes";

interface DataWipeDestination {
  destinationType?: "Member" | "Office" | "FP warehouse";
  member?: {
    memberId: string;
    assignedMember: string;
    assignedEmail: string;
    countryCode: string;
  };
  office?: {
    officeId: string;
    officeName: string;
    countryCode?: string;
  };
  warehouse?: {
    warehouseId: string;
    warehouseName: string;
    countryCode: string;
  };
}

interface DataWipeDetail {
  assetId: string;
  desirableDate?: string; // ISO date string (YYYY-MM-DD)
  destination?: DataWipeDestination;
}

interface StepDataWipeDetailsProps {
  assetIds: string[];
  dataWipeDetails: Record<string, DataWipeDetail>;
  additionalDetails?: string;
  onDataChange: (updates: Record<string, DataWipeDetail>) => void;
  onAdditionalDetailsChange?: (additionalDetails: string) => void;
}

export const StepDataWipeDetails: React.FC<StepDataWipeDetailsProps> = ({
  assetIds,
  dataWipeDetails,
  additionalDetails,
  onDataChange,
  onAdditionalDetailsChange,
}) => {
  const { data: assetsData } = useGetTableAssets();
  const { data: membersData, isLoading: isLoadingMembers } = useFetchMembers();
  const { offices: officesData, isLoading: isLoadingOffices } = useOffices();
  
  // Extraer los datos correctamente con validación defensiva para evitar errores de hidratación
  const members = React.useMemo(() => {
    if (!membersData || !Array.isArray(membersData)) return [];
    return membersData;
  }, [membersData]);
  
  const offices = React.useMemo(() => {
    if (!officesData || !Array.isArray(officesData)) return [];
    return officesData;
  }, [officesData]);
  
  const today = startOfToday();

  // Solo expandir el primer asset por defecto
  const [expandedAssets, setExpandedAssets] = React.useState<Set<string>>(
    assetIds.length > 0 ? new Set([assetIds[0]]) : new Set()
  );

  // Actualizar expandedAssets cuando cambien los assetIds
  React.useEffect(() => {
    if (assetIds.length > 0) {
      setExpandedAssets(new Set([assetIds[0]]));
    } else {
      setExpandedAssets(new Set());
    }
  }, [assetIds]);

  // Encontrar los assets seleccionados
  const selectedAssets = React.useMemo(() => {
    if (!assetIds || assetIds.length === 0 || !assetsData) return [];

    const assets: Product[] = [];
    for (const categoryGroup of assetsData) {
      if (categoryGroup.products) {
        assetIds.forEach((assetId) => {
          const asset = categoryGroup.products.find((p) => p._id === assetId);
          if (asset) assets.push(asset);
        });
      }
    }
    return assets;
  }, [assetIds, assetsData]);

  // Obtener información de display del asset
  const getAssetDisplayInfo = (product: Product) => {
    const brand =
      product.attributes?.find(
        (attr) => String(attr.key).toLowerCase() === "brand"
      )?.value || "";
    const model =
      product.attributes?.find(
        (attr) => String(attr.key).toLowerCase() === "model"
      )?.value || "";

    let displayName = "";
    if (brand && model) {
      displayName = model === "Other" ? `${brand} Other` : `${brand} ${model}`;
    } else {
      displayName = product.name || "No name";
    }

    let specifications = "";
    const parts: string[] = [];
    if (brand) parts.push(brand);
    if (model) parts.push(model);
    specifications = parts.join(" • ");

    return { displayName, specifications };
  };

  const updateDataWipeDetail = (
    assetId: string,
    field: keyof DataWipeDetail,
    value: any
  ) => {
    const currentDetail = dataWipeDetails[assetId] || { assetId };
    const updatedDetails = {
      ...dataWipeDetails,
      [assetId]: {
        ...currentDetail,
        [field]: value,
      },
    };
    onDataChange(updatedDetails);
  };

  const toggleExpanded = (assetId: string) => {
    const newExpanded = new Set(expandedAssets);
    if (newExpanded.has(assetId)) {
      newExpanded.delete(assetId);
    } else {
      newExpanded.add(assetId);
    }
    setExpandedAssets(newExpanded);
  };

  if (selectedAssets.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <p className="text-muted-foreground">No assets selected.</p>
      </div>
    );
  }

  // Ordenar oficinas para que la por defecto aparezca primero
  const sortedOffices = React.useMemo(() => {
    if (!offices || !Array.isArray(offices) || offices.length === 0) return [];
    return [...offices].sort((a, b) => {
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      return 0;
    });
  }, [offices]);

  // Construir opciones para el dropdown de destino
  const destinationOptions = React.useMemo(() => {
    // Validar que los datos sean arrays válidos para evitar errores de hidratación
    const safeMembers = (Array.isArray(members) && members.length > 0) ? members : [];
    const safeOffices = (Array.isArray(sortedOffices) && sortedOffices.length > 0) ? sortedOffices : [];

    const memberOptions = safeMembers.map((member) => ({
      display: `${member.firstName} ${member.lastName}`,
      value: `member_${member._id}`,
    }));

    const officeOptions = safeOffices.map((office) => {
      const countryName = office.country
        ? countriesByCode[office.country] || office.country
        : "";
      const displayLabel = `${countryName} - ${office.name}`;
      return {
        display: (
          <>
            {office.country && (
              <TooltipProvider>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <div>
                      <CountryFlag
                        countryName={office.country}
                        size={16}
                        className="rounded-sm"
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-blue/80 text-white text-xs">
                    {countryName || office.country}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <span className="truncate">{displayLabel}</span>
          </>
        ),
        value: `office_${office._id}`,
      };
    });

    const groups = [];
    
    if (memberOptions.length > 0) {
      groups.push({
        label: "Member",
        options: memberOptions,
      });
    }
    
    if (officeOptions.length > 0) {
      groups.push({
        label: "Our offices",
        options: officeOptions,
      });
    }

    return groups;
  }, [members, sortedOffices]);

  // FP warehouse como opción directa (sin grupo)
  const directOptions = React.useMemo(() => {
    return [{
      display: "FP warehouse",
      value: "FP warehouse",
    }];
  }, []);

  const getDestinationDisplayValue = (detail: DataWipeDetail) => {
    if (!detail.destination) return "";
    const { destinationType, member, office, warehouse } = detail.destination;

    if (destinationType === "Member" && member) {
      return `member_${member.memberId}`;
    }
    if (destinationType === "Office" && office) {
      return `office_${office.officeId}`;
    }
    if (destinationType === "FP warehouse") {
      return "FP warehouse";
    }
    return "";
  };

  const handleDestinationChange = (assetId: string, selectedValue: string, asset?: Product) => {
    if (!selectedValue) {
      updateDataWipeDetail(assetId, "destination", undefined);
      return;
    }

    if (selectedValue === "FP warehouse") {
      // Para FP warehouse, usar el countryCode del asset actual
      const countryCode = asset?.countryCode || 
                         asset?.country || 
                         asset?.fpWarehouse?.warehouseCountryCode || 
                         "";
      
      if (!countryCode) {
        // Si no hay countryCode, no se puede continuar
        console.warn(`Asset ${assetId} does not have a countryCode for FP warehouse destination`);
        return;
      }
      
      updateDataWipeDetail(assetId, "destination", {
        destinationType: "FP warehouse",
        warehouse: {
          countryCode: countryCode,
        },
      });
      return;
    }

    const [type, id] = selectedValue.split("_");

    if (type === "member") {
      const member = members.find((m) => m._id === id);
      if (member) {
        updateDataWipeDetail(assetId, "destination", {
          destinationType: "Member",
          member: {
            memberId: member._id,
            assignedMember: `${member.firstName} ${member.lastName}`,
            assignedEmail: member.email || "",
            countryCode: member.countryCode || "",
          },
        });
      }
    } else if (type === "office") {
      const office = sortedOffices.find((o) => o._id === id);
      if (office) {
        const countryName = office.country
          ? countriesByCode[office.country] || office.country
          : "";
        updateDataWipeDetail(assetId, "destination", {
          destinationType: "Office",
          office: {
            officeId: office._id,
            officeName: `${countryName} - ${office.name}`,
            countryCode: office.country,
          },
        });
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <p className="text-muted-foreground text-center">
        Expand each asset to provide additional information (optional)
      </p>

      <div className="flex flex-col gap-4 pr-2">
        {selectedAssets.map((asset) => {
          const { displayName, specifications } = getAssetDisplayInfo(asset);
          const detail = dataWipeDetails[asset._id] || { assetId: asset._id };
          const isExpanded = expandedAssets.has(asset._id);

          const date = React.useMemo(() => {
            if (!detail.desirableDate) return undefined;
            const dateMatch = detail.desirableDate.match(/^(\d{4})[-\/](\d{2})[-\/](\d{2})/);
            if (!dateMatch) return undefined;
            const [, year, month, day] = dateMatch;
            return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          }, [detail.desirableDate]);

          const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);

          const handleDateSelect = (selectedDate: Date | undefined) => {
            if (selectedDate) {
              const dateOnly = format(selectedDate, "yyyy-MM-dd");
              updateDataWipeDetail(asset._id, "desirableDate", dateOnly);
              setIsCalendarOpen(false);
            } else {
              updateDataWipeDetail(asset._id, "desirableDate", undefined);
            }
          };

          return (
            <div
              key={asset._id}
              className={cn(
                "border-2 rounded-lg p-4 bg-white transition-all",
                isExpanded
                  ? "border-blue shadow-sm"
                  : "border-gray-200 hover:border-blue/50 cursor-pointer"
              )}
            >
              {/* Asset Header - Clickable */}
              <button
                type="button"
                onClick={() => toggleExpanded(asset._id)}
                className="flex justify-between items-center w-full text-left"
              >
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-base">{displayName}</span>
                  {specifications && (
                    <span className="text-sm text-gray-600">{specifications}</span>
                  )}
                  {asset.serialNumber && (
                    <span className="text-xs text-gray-500">
                      SN: {asset.serialNumber}
                    </span>
                  )}
                </div>
                {isExpanded ? (
                  <ChevronDown
                    size={20}
                    className="text-blue transition-all duration-200"
                  />
                ) : (
                  <ChevronRight
                    size={20}
                    className="text-gray-500 transition-all duration-200"
                  />
                )}
              </button>

              {/* Form Fields - Show when expanded */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                  {/* Desirable Date */}
                  <div className="flex flex-col gap-2">
                    <Label htmlFor={`date-${asset._id}`}>
                      For how long do you need it? (optional)
                    </Label>
                    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          id={`date-${asset._id}`}
                          variant="outline"
                          className={cn(
                            "justify-start w-full font-normal text-left",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 w-4 h-4" />
                          {date ? format(date, "dd/MM/yyyy") : <span>dd/mm/yyyy</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="bg-white p-0 w-auto" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={handleDateSelect}
                          disabled={(date) => date < today}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Destination */}
                  <div className="flex flex-col gap-2">
                    <Label htmlFor={`destination-${asset._id}`}>
                      Where should it be returned? (optional)
                    </Label>
                    <SelectDropdownOptions
                      label=""
                      placeholder="Select destination..."
                      value={getDestinationDisplayValue(detail)}
                      options={directOptions}
                      optionGroups={destinationOptions}
                      onChange={(value) => handleDestinationChange(asset._id, value, asset)}
                      searchable={true}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Additional Details (for the whole service) */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="additional-details">Additional details (optional)</Label>
        <textarea
          id="additional-details"
          placeholder="General information about the data wipe request..."
          value={additionalDetails || ""}
          onChange={(e) => {
            if (onAdditionalDetailsChange) {
              onAdditionalDetailsChange(e.target.value);
            }
          }}
          rows={3}
          className="flex bg-background disabled:opacity-50 px-3 py-2 border border-input rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ring-offset-background focus-visible:ring-offset-2 w-full min-h-[80px] placeholder:text-muted-foreground text-sm disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );
};
