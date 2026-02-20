"use client";

import * as React from "react";
import { format, startOfToday } from "date-fns";
import { CalendarIcon, ChevronDown, ChevronRight, AlertTriangle } from "lucide-react";
import { Label } from "@/shared/components/ui/label";
import { Button } from "@/shared/components/ui/button";
import { Calendar } from "@/shared/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { cn } from "@/shared";
import { useGetTableAssets, Product, ProductTable, CategoryIcons } from "@/features/assets";
import { useFetchMembers } from "@/features/members";
import { useOffices } from "@/features/settings";
import SelectDropdownOptions from "@/shared/components/select-dropdown-options";
import {
  CountryFlag,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared";
import { countriesByCode } from "@/shared/constants/country-codes";
import type {
  DataWipeDetail,
  DataWipeDestination,
} from "@/features/quotes/types/quote.types";

// Formato estandarizado: Brand Model (Name)
const getAssetDisplayInfo = (product: Product) => {
  const brand =
    product.attributes?.find(
      (attr) => String(attr.key).toLowerCase() === "brand"
    )?.value || "";
  const model =
    product.attributes?.find(
      (attr) => String(attr.key).toLowerCase() === "model"
    )?.value || "";

  const parts: string[] = [];
  if (brand) parts.push(brand);
  if (model && model !== "Other") parts.push(model);
  else if (model === "Other") parts.push("Other");

  let displayName = "";
  if (parts.length > 0) {
    displayName = product.name
      ? `${parts.join(" ")} ${product.name}`.trim()
      : parts.join(" ");
  } else {
    displayName = product.name || "No name";
  }

  return { displayName };
};

const getAssignmentInfo = (product: Product) => {
  const country =
    product.office?.officeCountryCode ||
    product.country ||
    product.countryCode ||
    "";

  if (product.assignedMember || product.assignedEmail) {
    return {
      country,
      assignedTo: product.assignedMember || product.assignedEmail || "Unassigned",
    };
  }
  if (product.location === "Our office") {
    const officeName =
      product.office?.officeName || product.officeName || "Our office";
    return { country, assignedTo: `Office ${officeName}` };
  }
  if (product.location === "FP warehouse") {
    return { country, assignedTo: "FP Warehouse" };
  }
  if (product.location) {
    return { country, assignedTo: product.location };
  }
  return null;
};

interface StepDataWipeDetailsProps {
  assetIds: string[];
  dataWipeDetails: Record<string, DataWipeDetail>;
  additionalDetails?: string;
  onDataChange: (updates: Record<string, DataWipeDetail>) => void;
  onAdditionalDetailsChange?: (additionalDetails: string) => void;
}

// País del destino de return (Data Wipe)
function getDataWipeDestinationCountryCode(dest: DataWipeDestination | undefined): string {
  if (!dest) return "";
  if (dest.destinationType === "Member" && dest.member?.countryCode)
    return (dest.member.countryCode || "").trim().toUpperCase();
  if (dest.destinationType === "Office" && dest.office?.countryCode)
    return (dest.office.countryCode || "").trim().toUpperCase();
  if (dest.destinationType === "FP warehouse" && dest.warehouse?.countryCode)
    return (dest.warehouse.countryCode || "").trim().toUpperCase();
  return "";
}

// Componente para cada asset item (para evitar hooks dentro del map)
interface AssetItemProps {
  asset: Product;
  detail: DataWipeDetail;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onUpdateDetail: (field: keyof DataWipeDetail, value: any) => void;
  destinationOptions: any[];
  directOptions: any[];
  getDestinationDisplayValue: (detail: DataWipeDetail) => string;
  handleDestinationChange: (selectedValue: string) => void;
  isIntercountry?: boolean;
  intercountryLabel?: string;
}

const AssetItem: React.FC<AssetItemProps> = ({
  asset,
  detail,
  isExpanded,
  onToggleExpanded,
  onUpdateDetail,
  destinationOptions,
  directOptions,
  getDestinationDisplayValue,
  handleDestinationChange,
  isIntercountry,
  intercountryLabel,
}) => {
  const { displayName } = getAssetDisplayInfo(asset);
  const today = startOfToday();

  const date = React.useMemo(() => {
    if (!detail.desirableDate) return undefined;
    const dateMatch = detail.desirableDate.match(
      /^(\d{4})[-\/](\d{2})[-\/](\d{2})/
    );
    if (!dateMatch) return undefined;
    const [, year, month, day] = dateMatch;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }, [detail.desirableDate]);

  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const dateOnly = format(selectedDate, "yyyy-MM-dd");
      onUpdateDetail("desirableDate", dateOnly);
      setIsCalendarOpen(false);
    } else {
      onUpdateDetail("desirableDate", undefined);
    }
  };

  const assignment = getAssignmentInfo(asset);
  const countryName = assignment?.country
    ? countriesByCode[assignment.country] || assignment.country
    : "";

  return (
    <div
      className={cn(
        "bg-white p-4 border-2 rounded-lg transition-all",
        isExpanded
          ? "border-blue shadow-sm"
          : "border-gray-200 hover:border-blue/50 cursor-pointer",
        isIntercountry && "border-amber-500"
      )}
    >
      {/* Asset Header - Clickable (estandarizado: icono categoría, nombre, SN, Location) */}
      <button
        type="button"
        onClick={onToggleExpanded}
        className="flex items-start gap-3 w-full text-left"
      >
        <div className="flex-shrink-0 mt-0.5">
          <CategoryIcons products={[asset]} />
        </div>
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <span className="font-semibold text-sm">{displayName}</span>
          {asset.serialNumber && (
            <span className="text-gray-500 text-xs">
              <span className="font-medium">SN:</span> {asset.serialNumber}
            </span>
          )}
          {assignment && (
            <div className="flex flex-wrap items-center gap-1 text-gray-600 text-xs">
              <span className="font-medium">Location:</span>
              {assignment.country && (
                <TooltipProvider>
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <span className="inline-flex">
                        <CountryFlag
                          countryName={assignment.country}
                          size={18}
                        />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="bg-blue/80 text-white text-xs">
                      {countryName}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {assignment.assignedTo && (
                <span>{assignment.assignedTo}</span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
          {isIntercountry && (
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          )}
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
        </div>
      </button>

      {/* Form Fields - Show when expanded */}
      {isExpanded && (
        <div className="space-y-4 mt-4 pt-4 border-gray-200 border-t">
          {/* Desirable Date */}
          <div className="flex flex-col gap-2">
            <Label htmlFor={`date-${asset._id}`}>
              By when would you need it returned?
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
              Where should it be returned?
            </Label>
            <SelectDropdownOptions
              label=""
              placeholder="Select destination..."
              value={getDestinationDisplayValue(detail)}
              options={directOptions}
              optionGroups={destinationOptions}
              onChange={handleDestinationChange}
              searchable={true}
              compact={true}
              quotesFormStyle
            />
            {isIntercountry && intercountryLabel && (
              <div className="flex items-start gap-2 text-amber-700 text-sm bg-amber-50/50 border border-amber-500/50 rounded-md px-2 py-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <span>
                  This is an intercountry return ({intercountryLabel})
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

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

  // Actualizar expandedAssets cuando cambien los assetIds - siempre expandir el primero
  React.useEffect(() => {
    if (assetIds.length > 0 && assetIds[0]) {
      // Siempre expandir el primer asset según el orden de assetIds
      setExpandedAssets(new Set([assetIds[0]]));
    } else {
      setExpandedAssets(new Set());
    }
  }, [assetIds]);

  // Encontrar los assets seleccionados manteniendo el orden de assetIds
  const selectedAssets = React.useMemo(() => {
    if (!assetIds || assetIds.length === 0 || !assetsData) return [];

    // Crear un mapa de todos los productos para búsqueda rápida
    const productsMap = new Map<string, Product>();
    for (const categoryGroup of assetsData) {
      if (categoryGroup.products) {
        categoryGroup.products.forEach((product) => {
          productsMap.set(product._id, product);
        });
      }
    }

    // Mantener el orden de assetIds al construir el array
    const assets: Product[] = [];
    assetIds.forEach((assetId) => {
      const asset = productsMap.get(assetId);
      if (asset) assets.push(asset);
    });
    return assets;
  }, [assetIds, assetsData]);

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
    const safeMembers =
      Array.isArray(members) && members.length > 0 ? members : [];
    const safeOffices =
      Array.isArray(sortedOffices) && sortedOffices.length > 0
        ? sortedOffices
        : [];

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
    return [
      {
        display: "FP warehouse",
        value: "FP warehouse",
      },
    ];
  }, []);

  // Intercountry: return destination en otro país que el origen del asset
  const intercountryAssets = React.useMemo(() => {
    return selectedAssets.filter((asset) => {
      const assignment = getAssignmentInfo(asset);
      const originCountry = (assignment?.country || "").trim().toUpperCase();
      const detail = dataWipeDetails[asset._id] || { assetId: asset._id };
      const destCountry = getDataWipeDestinationCountryCode(detail.destination);
      return !!(originCountry && destCountry && originCountry !== destCountry);
    });
  }, [selectedAssets, dataWipeDetails]);

  const isAssetIntercountry = (asset: Product): boolean => {
    const assignment = getAssignmentInfo(asset);
    const originCountry = (assignment?.country || "").trim().toUpperCase();
    const detail = dataWipeDetails[asset._id] || { assetId: asset._id };
    const destCountry = getDataWipeDestinationCountryCode(detail.destination);
    return !!(originCountry && destCountry && originCountry !== destCountry);
  };

  const getIntercountryLabel = (asset: Product): string => {
    const assignment = getAssignmentInfo(asset);
    const originCode = (assignment?.country || "").trim().toUpperCase();
    const detail = dataWipeDetails[asset._id] || { assetId: asset._id };
    const destCountry = getDataWipeDestinationCountryCode(detail.destination);
    const originName = originCode ? countriesByCode[originCode] || assignment?.country : "";
    const destCode = destCountry || "";
    const destName = destCode ? countriesByCode[destCode] || destCountry : "";
    return `${originName} → ${destName}`;
  };

  if (selectedAssets.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <p className="text-muted-foreground">No assets selected.</p>
      </div>
    );
  }

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

  const handleDestinationChange = (
    assetId: string,
    selectedValue: string,
    asset?: Product
  ) => {
    if (!selectedValue) {
      updateDataWipeDetail(assetId, "destination", undefined);
      return;
    }

    if (selectedValue === "FP warehouse") {
      // Para FP warehouse, usar el countryCode del asset actual
      const countryCode =
        asset?.countryCode ||
        asset?.country ||
        (asset as any)?.fpWarehouse?.warehouseCountryCode ||
        "";

      if (!countryCode) {
        // Si no hay countryCode, no se puede continuar
        console.warn(
          `Asset ${assetId} does not have a countryCode for FP warehouse destination`
        );
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
            memberId: member._id || "",
            assignedMember: `${member.firstName} ${member.lastName}`,
            assignedEmail: member.email || "",
            countryCode: (member as any).countryCode || member.country || "",
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
        Expand each asset to provide additional information
      </p>

      {/* Intercountry warning - mismo estilo que Logistics y Offboarding */}
      {intercountryAssets.length > 0 && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50/30 border border-amber-500/50 text-amber-800">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
          <p className="text-sm">
            Intercountry return detected. {intercountryAssets.length} asset
            {intercountryAssets.length !== 1 ? "s" : ""} will be returned to a
            different country, which is usually significantly more expensive and
            takes longer.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-4 pr-2">
        {selectedAssets.map((asset) => {
          const detail = dataWipeDetails[asset._id] || { assetId: asset._id };
          const isExpanded = expandedAssets.has(asset._id);
          const intercountry = isAssetIntercountry(asset);
          const intercountryLabel = getIntercountryLabel(asset);

          return (
            <AssetItem
              key={asset._id}
              asset={asset}
              detail={detail}
              isExpanded={isExpanded}
              onToggleExpanded={() => toggleExpanded(asset._id)}
              onUpdateDetail={(field, value) =>
                updateDataWipeDetail(asset._id, field, value)
              }
              destinationOptions={destinationOptions}
              directOptions={directOptions}
              getDestinationDisplayValue={getDestinationDisplayValue}
              handleDestinationChange={(value) =>
                handleDestinationChange(asset._id, value, asset)
              }
              isIntercountry={intercountry}
              intercountryLabel={intercountryLabel}
            />
          );
        })}
      </div>

      {/* Additional Details (for the whole service) */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="additional-details">Additional details</Label>
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
