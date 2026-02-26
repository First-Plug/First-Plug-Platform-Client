import React from "react";
import {
  CountryFlag,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared";
import { countriesByCode } from "@/shared/constants/country-codes";
import { normalizeCountryCode } from "@/shared/utils/countryCodeNormalizer";

/** Location from productSnapshot: { location, assignedTo, countryCode } */
export interface ProductSnapshotLocation {
  location?: string;
  assignedTo?: string;
  countryCode?: string;
}

/** Data Wipe destination structure */
export interface DataWipeDestinationFormat {
  destinationType?: "Member" | "Employee" | "Office" | "Our office" | "FP warehouse";
  member?: {
    assignedMember?: string;
    assignedEmail?: string;
    countryCode?: string;
  };
  office?: {
    officeName?: string;
    countryCode?: string;
  };
  warehouse?: {
    warehouseName?: string;
    countryCode?: string;
  };
}

/** Logistics/Offboarding destination structure */
export interface LogisticsDestinationFormat {
  type?: "Member" | "Employee" | "Office" | "Warehouse";
  assignedMember?: string;
  officeName?: string;
  warehouseName?: string;
  countryCode?: string;
}

export interface QuoteLocationBlockProps {
  variant: "location";
  data: ProductSnapshotLocation;
}

export interface QuoteDestinationBlockProps {
  variant: "destination";
  data: DataWipeDestinationFormat | LogisticsDestinationFormat;
}

type QuoteLocationBlockAllProps = QuoteLocationBlockProps | QuoteDestinationBlockProps;

function getLocationSuffix(data: ProductSnapshotLocation): string {
  if (!data.location && !data.assignedTo) return "N/A";
  if (data.location === "Our office" && data.assignedTo) {
    return `Office ${data.assignedTo}`;
  }
  if (data.location === "FP warehouse") {
    return "FP Warehouse";
  }
  return data.assignedTo || data.location || "N/A";
}

function getDestinationSuffix(
  data: DataWipeDestinationFormat | LogisticsDestinationFormat
): { suffix: string; countryCode?: string } {
  const dest = data as DataWipeDestinationFormat;
  const logDest = data as LogisticsDestinationFormat;

  // Data Wipe format
  if (dest.destinationType) {
    if (dest.destinationType === "Member" || dest.destinationType === "Employee") {
      const member = dest.member;
      return {
        suffix: member?.assignedMember || member?.assignedEmail || "N/A",
        countryCode: member?.countryCode,
      };
    }
    if (dest.destinationType === "Office" || dest.destinationType === "Our office") {
      const office = dest.office;
      return {
        suffix: office?.officeName ? `Office ${office.officeName}` : "Office",
        countryCode: office?.countryCode,
      };
    }
    if (dest.destinationType === "FP warehouse") {
      const wh = dest.warehouse;
      return {
        suffix: "FP Warehouse",
        countryCode: wh?.countryCode,
      };
    }
  }

  // Logistics/Offboarding format (type: Member | Office | Warehouse)
  if (logDest.type) {
    if (logDest.type === "Member" || logDest.type === "Employee") {
      return {
        suffix: logDest.assignedMember || "N/A",
        countryCode: logDest.countryCode,
      };
    }
    if (logDest.type === "Office") {
      return {
        suffix: logDest.officeName ? `Office ${logDest.officeName}` : "Office",
        countryCode: logDest.countryCode,
      };
    }
    if (logDest.type === "Warehouse") {
      return {
        suffix: "FP Warehouse",
        countryCode: logDest.countryCode,
      };
    }
  }

  return { suffix: "N/A" };
}

export function QuoteLocationBlock(props: QuoteLocationBlockAllProps) {
  let countryCode: string | undefined;
  let suffix: string;

  if (props.variant === "location") {
    const data = props.data as ProductSnapshotLocation;
    countryCode = data.countryCode;
    suffix = getLocationSuffix(data);
  } else {
    const { suffix: s, countryCode: cc } = getDestinationSuffix(
      props.data as DataWipeDestinationFormat | LogisticsDestinationFormat
    );
    suffix = s;
    countryCode = cc;
  }

  const normalizedCountry = countryCode ? normalizeCountryCode(countryCode) : null;
  const countryName = normalizedCountry
    ? countriesByCode[normalizedCountry] || countryCode
    : countryCode;

  if (!normalizedCountry && !countryCode) {
    return <span>{suffix}</span>;
  }

  return (
    <div className="flex items-center gap-2">
      {normalizedCountry && (
        <TooltipProvider>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <span>
                <CountryFlag countryName={normalizedCountry} size={15} />
              </span>
            </TooltipTrigger>
            <TooltipContent className="bg-blue/80 text-white text-xs">
              {countryName}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      <span>
        {countryName}
        {countryName && suffix !== "N/A" && ", "}
        {suffix}
      </span>
    </div>
  );
}
