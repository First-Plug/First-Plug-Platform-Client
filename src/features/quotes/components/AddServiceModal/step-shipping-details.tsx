"use client";

import * as React from "react";
import { format, isValid, parseISO } from "date-fns";
import { Package, ChevronDown, ChevronUp } from "lucide-react";
import * as Switch from "@radix-ui/react-switch";
import { Label } from "@/shared/components/ui/label";
import {
  useGetTableAssets,
  Product,
  ProductTable,
  CategoryIcons,
} from "@/features/assets";
import { useFetchMembers } from "@/features/members";
import { useOffices } from "@/features/settings";
import SelectDropdownOptions from "@/shared/components/select-dropdown-options";
import {
  cn,
  CountryFlag,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared";
import { countriesByCode } from "@/shared/constants/country-codes";
import type {
  LogisticsDestination,
  LogisticsDetailPerAsset,
} from "@/features/quotes/types/quote.types";
import { type AsapOrDateValue } from "@/features/shipments/components/ShipmentWithFp/asap-or-date";
import { AsapOrDateQuotes } from "./AsapOrDateQuotes";

/** Parsea YYYY-MM-DD a Date a mediodía local (solo fecha, sin depender de hora) */
function parseDateOnly(str: string | undefined): Date | undefined {
  if (!str) return undefined;
  const m = str.match(/^(\d{4})[-\/](\d{2})[-\/](\d{2})/);
  if (!m) return undefined;
  const [, y, mo, d] = m;
  return new Date(parseInt(y), parseInt(mo) - 1, parseInt(d), 12, 0, 0);
}

/** Comparación solo por día (sin tiempo) */
function toDateOnlyTimestamp(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/** Convierte string del formulario ("" | "ASAP" | "yyyy-MM-dd") a AsapOrDateValue */
function stringToAsap(s: string | undefined): AsapOrDateValue {
  if (!s) return "";
  if (s === "ASAP") return "ASAP";
  const parsed = parseISO(s);
  return isValid(parsed) ? parsed : "";
}

/** Convierte AsapOrDateValue a string para guardar */
function asapToString(v: AsapOrDateValue): string {
  if (v === "" || v === undefined) return "";
  if (v === "ASAP") return "ASAP";
  return format(v instanceof Date ? v : new Date(v), "yyyy-MM-dd");
}

/** Valor de destino/origen en formato dropdown (office_id, member_id, "FP warehouse") */
function getOriginValue(
  product: Product,
  members: Array<{
    _id?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
  }>,
  offices: Array<{ _id: string; name?: string; country?: string }>
): string {
  if (product.assignedMember || product.assignedEmail) {
    const member = members.find(
      (m) =>
        (m as any).email === product.assignedEmail ||
        `${(m as any).firstName || ""} ${(m as any).lastName || ""}`.trim() ===
          (product.assignedMember || "").trim()
    );
    if (member && (member as any)._id) return `member_${(member as any)._id}`;
  }
  if (product.location === "Our office") {
    const officeId = (product as any).officeId ?? (product as any).office?._id;
    if (officeId) return `office_${officeId}`;
    const productOfficeName = (
      (product as any).office?.officeName ??
      (product as any).office?.name ??
      (product as any).officeName ??
      ""
    ).trim();
    const productCountryRaw =
      (product as any).office?.country ??
      (product as any).officeCountryCode ??
      (product as any).countryCode ??
      (product as any).country ??
      "";
    if (productOfficeName && offices.length > 0) {
      const matched = offices.find((o) => {
        const nameMatch = (o.name ?? "").trim() === productOfficeName;
        const officeCountry = o.country ?? "";
        const productCountry = String(productCountryRaw).trim();
        const countryMatch =
          !productCountry ||
          officeCountry === productCountry ||
          (countriesByCode[officeCountry] &&
            countriesByCode[officeCountry] === productCountry);
        return nameMatch && countryMatch;
      });
      if (matched) return `office_${matched._id}`;
    }
  }
  if (product.location === "FP warehouse") return "FP warehouse";
  return "";
}

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

const getLocationLabel = (product: Product): string => {
  if (product.assignedMember || product.assignedEmail) {
    return String(
      product.assignedMember || product.assignedEmail || "Unassigned"
    );
  }
  if (product.location === "Our office") {
    return String(
      (product as any).office?.officeName ||
        (product as any).officeName ||
        "Our office"
    );
  }
  if (product.location === "FP warehouse") {
    return "FP warehouse";
  }
  return product.location || "";
};

/** "Origin: Buenos Aires Office • Argentina" */
const getOriginLabel = (product: Product): string => {
  const location = getLocationLabel(product);
  const countryCode =
    (product as any).office?.country ||
    (product as any).officeCountryCode ||
    product.countryCode ||
    (product as any).country ||
    "";
  const countryName = countryCode
    ? countriesByCode[countryCode] || countryCode
    : "";
  if (!countryName) return `Origin: ${location}`;
  return `Origin: ${location} • ${countryName}`;
};

/** Mismo formato que step-select-asset / Donation / Destruction: Location + Assigned to */
function getAssignmentInfo(product: Product): {
  country: string;
  assignedTo: string;
} | null {
  const country =
    (product as any).office?.country ||
    (product as any).officeCountryCode ||
    product.countryCode ||
    (product as any).country ||
    "";

  if (product.assignedMember || product.assignedEmail) {
    return {
      country,
      assignedTo:
        String(
          product.assignedMember || product.assignedEmail || "Unassigned"
        ).trim(),
    };
  }
  if (product.location === "Our office") {
    const officeName =
      (product as any).office?.officeName ||
      (product as any).officeName ||
      "Our office";
    return { country, assignedTo: `Office ${officeName}` };
  }
  if (product.location === "FP warehouse") {
    return { country, assignedTo: "FP Warehouse" };
  }
  if (product.location) {
    return { country, assignedTo: product.location };
  }
  return null;
}

interface StepShippingDetailsProps {
  assetIds: string[];
  sameDetailsForAllAssets?: boolean;
  logisticsDestination?: LogisticsDestination;
  desirablePickupDate?: string;
  desirableDeliveryDate?: string;
  logisticsDetailsPerAsset?: Record<string, LogisticsDetailPerAsset>;
  additionalDetails?: string;
  onDataChange: (updates: {
    sameDetailsForAllAssets?: boolean;
    logisticsDestination?: LogisticsDestination;
    desirablePickupDate?: string;
    desirableDeliveryDate?: string;
    logisticsDetailsPerAsset?: Record<string, LogisticsDetailPerAsset>;
    additionalDetails?: string;
  }) => void;
}

function getDestinationValue(dest: LogisticsDestination | undefined): string {
  if (!dest || !dest.type) return "";
  if (dest.type === "Office" && dest.officeId) return `office_${dest.officeId}`;
  if (dest.type === "Member" && dest.memberId) return `member_${dest.memberId}`;
  if (dest.type === "Warehouse") return "FP warehouse";
  return "";
}

export const StepShippingDetails: React.FC<StepShippingDetailsProps> = ({
  assetIds,
  sameDetailsForAllAssets = false,
  logisticsDestination,
  desirablePickupDate,
  desirableDeliveryDate,
  logisticsDetailsPerAsset,
  additionalDetails,
  onDataChange,
}) => {
  const { data: assetsData } = useGetTableAssets();
  const { data: membersData } = useFetchMembers();
  const { offices: officesData } = useOffices();

  const [expandedAssetIds, setExpandedAssetIds] = React.useState<Set<string>>(
    () => (assetIds?.length ? new Set([assetIds[0]]) : new Set())
  );
  const refSameDetailsDelivery = React.useRef<HTMLButtonElement | null>(null);
  const refCardDelivery = React.useRef<
    Record<string, HTMLButtonElement | null>
  >({});
  const [openDeliveryForScope, setOpenDeliveryForScope] = React.useState<
    string | null
  >(null);

  const toggleAssetExpanded = (assetId: string) => {
    setExpandedAssetIds((prev) => {
      const next = new Set(prev);
      if (next.has(assetId)) next.delete(assetId);
      else next.add(assetId);
      return next;
    });
  };

  const members = React.useMemo(() => {
    if (!membersData || !Array.isArray(membersData)) return [];
    return membersData;
  }, [membersData]);

  const offices = React.useMemo(() => {
    if (!officesData || !Array.isArray(officesData)) return [];
    return [...officesData].sort((a, b) => {
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      return 0;
    });
  }, [officesData]);

  const selectedAssets = React.useMemo(() => {
    if (!assetIds?.length || !assetsData) return [];

    const productsMap = new Map<string, Product>();
    for (const categoryGroup of assetsData as ProductTable[]) {
      if (categoryGroup.products) {
        categoryGroup.products.forEach((product) => {
          productsMap.set(product._id, product);
        });
      }
    }

    const assets: Product[] = [];
    assetIds.forEach((assetId) => {
      const asset = productsMap.get(assetId);
      if (asset) assets.push(asset);
    });
    return assets;
  }, [assetIds, assetsData]);

  // Opción directa "FP warehouse" (siempre visible, como en Data Wipe)
  const directDestinationOptions = React.useMemo(() => ["FP warehouse"], []);

  const destinationOptionGroups = React.useMemo(() => {
    const groups: {
      label: string;
      options: { display: React.ReactNode; value: string }[];
    }[] = [];

    if (members.length > 0) {
      groups.push({
        label: "Members",
        options: members.map((m) => ({
          display:
            `${(m as any).firstName || ""} ${(m as any).lastName || ""}`.trim() ||
            (m as any).email,
          value: `member_${(m as any)._id}`,
        })),
      });
    }

    if (offices.length > 0) {
      groups.push({
        label: "Offices",
        options: offices.map((office) => {
          const countryName = office.country
            ? countriesByCode[office.country] || office.country
            : "";
          const displayLabel = countryName
            ? `${countryName} - ${office.name}`
            : office.name;
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
        }),
      });
    }

    return groups;
  }, [members, offices]);

  /** Filtra opciones de destino excluyendo el valor de origen (destination ≠ origin por asset) */
  const getFilteredDestinationOptions = React.useCallback(
    (excludedOriginValue: string) => {
      if (!excludedOriginValue) {
        return {
          options: directDestinationOptions,
          optionGroups: destinationOptionGroups,
        };
      }
      const filteredDirect = directDestinationOptions.filter(
        (v) => v !== excludedOriginValue
      );
      const filteredGroups = destinationOptionGroups.map((g) => ({
        ...g,
        options: g.options.filter((o) => o.value !== excludedOriginValue),
      }));
      return { options: filteredDirect, optionGroups: filteredGroups };
    },
    [directDestinationOptions, destinationOptionGroups]
  );

  const destinationValue = getDestinationValue(logisticsDestination);

  const parseDestinationFromValue = (
    selectedValue: string
  ): LogisticsDestination | undefined => {
    if (!selectedValue) return undefined;
    if (selectedValue === "FP warehouse") return { type: "Warehouse" };
    const [type, id] = selectedValue.split("_");
    if (type === "member") {
      const member = members.find((m) => (m as any)._id === id);
      if (!member) return undefined;
      const m = member as any;
      return {
        type: "Member",
        memberId: m._id || "",
        assignedMember:
          `${m.firstName || ""} ${m.lastName || ""}`.trim() || m.email,
        assignedEmail: m.email || "",
        countryCode: m.countryCode || m.country || "",
      };
    }
    if (type === "office") {
      const office = offices.find((o) => o._id === id);
      if (!office) return undefined;
      return {
        type: "Office",
        officeId: office._id,
        officeName: office.name,
        countryCode: office.country || "",
      };
    }
    return undefined;
  };

  const getPerAssetDetail = (assetId: string): LogisticsDetailPerAsset =>
    logisticsDetailsPerAsset?.[assetId] || {};

  const handleDestinationChangeForAsset = (
    assetId: string,
    selectedValue: string
  ) => {
    const dest = parseDestinationFromValue(selectedValue);
    onDataChange({
      logisticsDetailsPerAsset: {
        ...logisticsDetailsPerAsset,
        [assetId]: {
          ...getPerAssetDetail(assetId),
          logisticsDestination: dest,
        },
      },
    });
  };

  const handlePickupDateForAsset = (
    assetId: string,
    dateStr: string | undefined
  ) => {
    onDataChange({
      logisticsDetailsPerAsset: {
        ...logisticsDetailsPerAsset,
        [assetId]: {
          ...getPerAssetDetail(assetId),
          desirablePickupDate: dateStr,
        },
      },
    });
  };

  const handleDeliveryDateForAsset = (
    assetId: string,
    dateStr: string | undefined
  ) => {
    onDataChange({
      logisticsDetailsPerAsset: {
        ...logisticsDetailsPerAsset,
        [assetId]: {
          ...getPerAssetDetail(assetId),
          desirableDeliveryDate: dateStr,
        },
      },
    });
  };

  const handleDestinationChange = (_selectedValue: string) => {
    // Destination is always per-asset; shared block when sameDetailsForAllAssets only has dates
    // Este handler ya no se usa para el bloque compartido (solo fechas)
  };

  const handleGlobalPickupDate = (dateStr: string) => {
    onDataChange({
      desirablePickupDate: dateStr,
      ...(sameDetailsForAllAssets &&
        assetIds.length > 0 && {
          logisticsDetailsPerAsset: assetIds.reduce(
            (acc, id) => ({
              ...acc,
              [id]: { ...getPerAssetDetail(id), desirablePickupDate: dateStr },
            }),
            {} as Record<string, LogisticsDetailPerAsset>
          ),
        }),
    });
  };

  const handleGlobalDeliveryDate = (dateStr: string) => {
    onDataChange({
      desirableDeliveryDate: dateStr,
      ...(sameDetailsForAllAssets &&
        assetIds.length > 0 && {
          logisticsDetailsPerAsset: assetIds.reduce(
            (acc, id) => ({
              ...acc,
              [id]: {
                ...getPerAssetDetail(id),
                desirableDeliveryDate: dateStr,
              },
            }),
            {} as Record<string, LogisticsDetailPerAsset>
          ),
        }),
    });
  };

  if (selectedAssets.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <p className="text-muted-foreground">No assets selected.</p>
      </div>
    );
  }

  const renderDestinationAndDates = (opts: {
    /** Si se pasa, se excluye del dropdown (destination ≠ origin) */
    excludedOriginValue?: string;
    destinationValue: string;
    onDestinationChange: (v: string) => void;
    pickupDate?: string;
    deliveryDate?: string;
    onPickupDate: (dateStr: string) => void;
    onDeliveryDate: (dateStr: string) => void;
    disabled?: boolean;
    /** false en el bloque "Same details" (solo sirve para cargar las cards, no es requerido) */
    showRequired?: boolean;
    /** true = solo fechas (ASAP o fecha), sin destino; para bloque "Same details" */
    datesOnly?: boolean;
    /** Scope único para ids de ASAP/fecha (evita que el clic en una card afecte a otra) */
    fieldScope?: string;
    /** Tras llenar Pickup, pasar focus a Delivery (por card o same-details) */
    onPickupFilled?: () => void;
    /** Ref del trigger (botón) de Delivery para poder hacer focus */
    deliveryInputRef?: React.Ref<HTMLButtonElement | null>;
    /** Abrir el calendario de Delivery al completar Pickup (por scope) */
    deliveryPopoverOpen?: boolean;
    onDeliveryPopoverOpenChange?: (open: boolean) => void;
  }) => {
    const showRequired = opts.showRequired !== false;
    const pickupAsap = stringToAsap(opts.pickupDate);
    const deliveryAsap = stringToAsap(opts.deliveryDate);
    const pickupVal = parseDateOnly(
      opts.pickupDate && opts.pickupDate !== "ASAP"
        ? opts.pickupDate
        : undefined
    );
    const deliveryVal = parseDateOnly(
      opts.deliveryDate && opts.deliveryDate !== "ASAP"
        ? opts.deliveryDate
        : undefined
    );

    /** Pickup ≤ Delivery: deshabilitar en calendario Pickup las fechas después de delivery */
    const pickupDisabledDate = (date: Date) =>
      !!deliveryVal &&
      toDateOnlyTimestamp(date) > toDateOnlyTimestamp(deliveryVal);
    /** Delivery ≥ Pickup: deshabilitar en calendario Delivery las fechas antes de pickup */
    const deliveryDisabledDate = (date: Date) =>
      !!pickupVal &&
      toDateOnlyTimestamp(date) < toDateOnlyTimestamp(pickupVal);

    const { options: destOptions, optionGroups: destOptionGroups } =
      getFilteredDestinationOptions(opts.excludedOriginValue || "");

    return (
      <>
        {!opts.datesOnly && (
          <div className="flex flex-col gap-2">
            <SelectDropdownOptions
              label="Destination"
              placeholder="Select destination"
              value={opts.destinationValue}
              onChange={opts.onDestinationChange}
              options={destOptions}
              optionGroups={destOptionGroups}
              required={showRequired}
              compact={true}
              quotesFormStyle
              disabled={opts.disabled}
            />
          </div>
        )}
        <div className="gap-4 grid grid-cols-2">
          <div className="flex flex-col gap-2">
            <AsapOrDateQuotes
              inputId={
                opts.fieldScope ? `pickup-${opts.fieldScope}` : undefined
              }
              label="Pickup Date"
              required={showRequired}
              value={pickupAsap}
              disabledDate={pickupDisabledDate}
              onFilled={opts.onPickupFilled}
              onChange={(v) => {
                opts.onPickupDate(asapToString(v));
                if (
                  v !== "" &&
                  v !== "ASAP" &&
                  deliveryVal &&
                  toDateOnlyTimestamp(v instanceof Date ? v : new Date()) >
                    toDateOnlyTimestamp(deliveryVal)
                ) {
                  opts.onDeliveryDate("");
                }
              }}
            />
          </div>
          <div className="flex flex-col gap-2">
            <AsapOrDateQuotes
              inputId={
                opts.fieldScope ? `delivery-${opts.fieldScope}` : undefined
              }
              label="Delivery Date"
              required={showRequired}
              inputRef={opts.deliveryInputRef}
              value={deliveryAsap}
              disabledDate={deliveryDisabledDate}
              open={opts.deliveryPopoverOpen}
              onOpenChange={opts.onDeliveryPopoverOpenChange}
              onChange={(v) => opts.onDeliveryDate(asapToString(v))}
            />
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Shipping Details card */}
      <div className="flex items-start gap-3 bg-gray-50/50 p-4 border border-gray-200 rounded-lg">
        <div className="flex justify-center items-center bg-blue/10 border border-blue/20 rounded-full w-10 h-10 shrink-0">
          <Package className="w-5 h-5 text-blue" />
        </div>
        <div>
          <p className="font-medium text-black">Shipping Details</p>
          <p className="text-muted-foreground text-sm">
            Configure shipping for {selectedAssets.length} asset
            {selectedAssets.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Same details for all assets */}
      <div className="flex justify-between items-start gap-4 bg-white p-4 border border-gray-200 rounded-lg">
        <div>
          <p className="font-medium text-sm">Same details for all assets</p>
          <p className="text-muted-foreground text-sm">
            Apply the same pickup and delivery dates to all selected assets
            (destination is chosen per asset)
          </p>
        </div>
        <Switch.Root
          checked={sameDetailsForAllAssets}
          onCheckedChange={(checked) => {
            if (checked && assetIds.length > 0) {
              // Same details solo para fechas: copiar solo pickup/delivery del primer asset; destino sigue siendo por asset
              const first = getPerAssetDetail(assetIds[0]);
              const next: Record<string, LogisticsDetailPerAsset> = {};
              assetIds.forEach((id) => {
                next[id] = {
                  ...getPerAssetDetail(id),
                  desirablePickupDate: first.desirablePickupDate,
                  desirableDeliveryDate: first.desirableDeliveryDate,
                };
              });
              onDataChange({
                sameDetailsForAllAssets: true,
                logisticsDetailsPerAsset: next,
                desirablePickupDate: first.desirablePickupDate,
                desirableDeliveryDate: first.desirableDeliveryDate,
              });
            } else {
              onDataChange({ sameDetailsForAllAssets: checked });
            }
          }}
          className={cn(
            "relative flex-shrink-0 rounded-full w-10 h-6 transition-colors duration-200",
            sameDetailsForAllAssets ? "bg-blue" : "bg-gray-300"
          )}
        >
          <Switch.Thumb
            className={cn(
              "block bg-white shadow-md rounded-full w-4 h-4 transform-gpu transition-transform duration-200",
              sameDetailsForAllAssets ? "translate-x-5" : "translate-x-1"
            )}
          />
        </Switch.Root>
      </div>

      {sameDetailsForAllAssets && (
        <div className="flex flex-col gap-4 bg-white p-4 border border-gray-200 rounded-lg">
          {renderDestinationAndDates({
            datesOnly: true,
            fieldScope: "same-details",
            destinationValue: "",
            onDestinationChange: () => {},
            pickupDate: desirablePickupDate,
            deliveryDate: desirableDeliveryDate,
            onPickupDate: handleGlobalPickupDate,
            onDeliveryDate: handleGlobalDeliveryDate,
            showRequired: true,
            onPickupFilled: () => {
              // Retrasar apertura del popover de Delivery para evitar que Radix lo cierre
              // al detectar "focus outside" cuando aún se está cerrando el popover de Pickup.
              setTimeout(() => {
                setOpenDeliveryForScope("same-details");
                setTimeout(() => refSameDetailsDelivery.current?.focus(), 0);
              }, 150);
            },
            deliveryInputRef: refSameDetailsDelivery,
            deliveryPopoverOpen: openDeliveryForScope === "same-details",
            onDeliveryPopoverOpenChange: (open) => {
              setOpenDeliveryForScope(open ? "same-details" : null);
            },
          })}
        </div>
      )}

      {/* Per-asset cards (collapsible) */}
      <div className="flex flex-col gap-3">
        {selectedAssets.map((asset) => {
          const { displayName } = getAssetDisplayInfo(asset);
          const category = asset.category || "Computer";
          const assignment = getAssignmentInfo(asset);
          const isExpanded = expandedAssetIds.has(asset._id);
          const detail = getPerAssetDetail(asset._id);
          const assetDestValue = getDestinationValue(
            detail.logisticsDestination
          );
          const originValue = getOriginValue(asset, members, offices);
          const hasDates = sameDetailsForAllAssets
            ? !!(desirablePickupDate && desirableDeliveryDate)
            : !!(detail.desirablePickupDate && detail.desirableDeliveryDate);
          const isConfigured = !!detail.logisticsDestination && hasDates;
          return (
            <div
              key={asset._id}
              className="border rounded-lg bg-white overflow-hidden border-gray-200"
            >
              <button
                type="button"
                onClick={() => toggleAssetExpanded(asset._id)}
                className="flex justify-between items-center gap-3 w-full p-4 text-left transition-colors hover:bg-gray-50/50"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex justify-center items-center w-10 h-10 rounded-lg bg-gray-100 shrink-0 [&_svg]:w-5 [&_svg]:h-5 [&_svg]:text-gray-500">
                    <CategoryIcons products={[asset]} />
                  </div>
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="font-semibold text-sm text-gray-900">
                      {displayName} ({category})
                      {isConfigured && (
                        <span className="ml-2 font-medium text-blue text-xs">
                          Configured
                        </span>
                      )}
                    </span>
                    {asset.serialNumber && (
                      <div className="text-gray-600 text-xs">
                        <span className="font-medium">SN:</span>{" "}
                        {asset.serialNumber}
                      </div>
                    )}
                    {assignment && (
                      <div className="flex items-center gap-1 text-gray-600 text-xs">
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
                                {countriesByCode[assignment.country] ||
                                  assignment.country}
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
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                )}
              </button>
              {isExpanded && (
                <div className="flex flex-col gap-4 px-4 pt-4 pb-4 border-gray-100 border-t">
                  {sameDetailsForAllAssets ? (
                    <>
                      <div className="flex flex-col gap-2">
                        <SelectDropdownOptions
                          label="Destination"
                          placeholder="Select destination"
                          value={assetDestValue}
                          onChange={(v) =>
                            handleDestinationChangeForAsset(asset._id, v)
                          }
                          options={
                            getFilteredDestinationOptions(originValue).options
                          }
                          optionGroups={
                            getFilteredDestinationOptions(originValue)
                              .optionGroups
                          }
                          required={true}
                          compact={true}
                          quotesFormStyle
                        />
                      </div>
                      <p className="text-muted-foreground text-sm">
                        Using same dates for all assets. Edit pickup and
                        delivery in &quot;Same details for all assets&quot;
                        above.
                      </p>
                    </>
                  ) : (
                    renderDestinationAndDates({
                      fieldScope: asset._id,
                      excludedOriginValue: originValue,
                      destinationValue: assetDestValue,
                      onDestinationChange: (v) =>
                        handleDestinationChangeForAsset(asset._id, v),
                      pickupDate: detail.desirablePickupDate,
                      deliveryDate: detail.desirableDeliveryDate,
                      onPickupDate: (s) =>
                        handlePickupDateForAsset(asset._id, s),
                      onDeliveryDate: (s) =>
                        handleDeliveryDateForAsset(asset._id, s),
                      showRequired: true,
                      onPickupFilled: () => {
                        // Retrasar apertura del popover de Delivery para evitar que se cierre solo.
                        setTimeout(() => {
                          setOpenDeliveryForScope(asset._id);
                          setTimeout(
                            () => refCardDelivery.current[asset._id]?.focus(),
                            0
                          );
                        }, 150);
                      },
                      deliveryInputRef: (el) => {
                        if (refCardDelivery.current)
                          refCardDelivery.current[asset._id] = el;
                      },
                      deliveryPopoverOpen: openDeliveryForScope === asset._id,
                      onDeliveryPopoverOpenChange: (open) => {
                        setOpenDeliveryForScope(open ? asset._id : null);
                      },
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Additional details */}
      <div className="flex flex-col gap-2">
        <Label
          htmlFor="shipping-additional-comments"
          className="font-medium text-sm"
        >
          Additional details
        </Label>
        <textarea
          id="shipping-additional-comments"
          placeholder="Any special instructions or requirements..."
          value={additionalDetails || ""}
          onChange={(e) => onDataChange({ additionalDetails: e.target.value })}
          rows={3}
          className="flex bg-background disabled:opacity-50 px-3 py-2 border border-input rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ring-offset-background w-full min-h-[80px] placeholder:text-muted-foreground text-sm"
        />
      </div>
    </div>
  );
};
