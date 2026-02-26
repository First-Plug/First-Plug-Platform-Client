import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  CountryFlag,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared";
import type {
  QuoteHistoryProduct,
  QuoteHistoryService,
  EnrolledDeviceSnapshot,
  ITSupportProductSnapshot,
  BuybackProductSnapshot,
  BuybackDetails,
} from "../types/quote.types";
import { countriesByCode } from "@/shared/constants/country-codes";
import { normalizeCountryCode } from "@/shared/utils/countryCodeNormalizer";
import { QuoteLocationBlock } from "./QuoteLocationBlock";
import { formatBrandModelName } from "../utils/quoteDisplayFormatters";

interface QuoteHistorySubtableProps {
  products?: QuoteHistoryProduct[];
  services?: QuoteHistoryService[];
}

type TableRow =
  | { type: "product"; data: QuoteHistoryProduct }
  | {
      type: "service";
      serviceCategory: string;
      data: EnrolledDeviceSnapshot;
      index: number;
      total: number;
    }
  | {
      type: "service";
      serviceCategory: "IT Support";
      data: ITSupportProductSnapshot;
      issues?: string[];
      description?: string;
      impactLevel?: string;
      issueStartDate?: string;
    }
  | {
      type: "service";
      serviceCategory: "Buyback";
      data: BuybackProductSnapshot;
      buybackDetails?: BuybackDetails;
      additionalInfo?: string;
      index: number;
      total: number;
    }
  | {
      type: "service";
      serviceCategory: "Data Wipe";
      data: any; // productSnapshot
      dataWipeAsset?: any; // asset completo con destination, desirableDate, etc.
      additionalDetails?: string;
      index: number;
      total: number;
    }
  | {
      type: "service";
      serviceCategory: "Cleaning";
      data: any; // productSnapshot
      cleaningProduct?: {
        productSnapshot: any;
        desiredDate?: string;
        cleaningType?: string;
        additionalComments?: string;
      };
      additionalDetails?: string;
      index: number;
      total: number;
    }
  | {
      type: "service";
      serviceCategory: "Donate";
      data: any; // productSnapshot
      donateProduct?: {
        productId: string;
        productSnapshot: any;
        needsDataWipe?: boolean;
        needsCleaning?: boolean;
        comments?: string;
      };
      additionalDetails?: string;
      index: number;
      total: number;
    }
  | {
      type: "service";
      serviceCategory: "Storage";
      data: any; // productSnapshot
      storageProduct?: {
        productId: string;
        productSnapshot: any;
        approximateSize?: string;
        approximateWeight?: string;
        approximateStorageDays?: string;
        additionalComments?: string;
      };
      additionalDetails?: string;
      index: number;
      total: number;
    }
  | {
      type: "service";
      serviceCategory: "Destruction and Recycling";
      data: any; // productSnapshot
      destructionProduct?: {
        productId: string;
        productSnapshot: any;
      };
      requiresCertificate?: boolean;
      comments?: string;
      index: number;
      total: number;
    }
  | {
      type: "service";
      serviceCategory: "Logistics";
      data: any; // productSnapshot
      logisticsProduct?: {
        productId: string;
        productSnapshot: any;
        destination?: {
          type: string;
          officeName?: string;
          assignedMember?: string;
          assignedEmail?: string;
          warehouseName?: string;
          countryCode?: string;
        };
      };
      desirablePickupDate?: string;
      additionalDetails?: string;
      index: number;
      total: number;
    }
  | {
      type: "service";
      serviceCategory: "Offboarding";
      data: any; // productSnapshot
      offboardingProduct?: {
        productId: string;
        productSnapshot: any;
        destination?: {
          type: string;
          assignedMember?: string;
          officeName?: string;
          warehouseName?: string;
          countryCode?: string;
        };
      };
      originMember?: {
        memberId?: string;
        firstName?: string;
        lastName?: string;
        email?: string;
        countryCode?: string;
      };
      isSensitiveSituation?: boolean;
      employeeKnows?: boolean;
      desirablePickupDate?: string;
      additionalDetails?: string;
      index: number;
      total: number;
    };

const formatDate = (date?: string) => {
  if (!date) return "N/A";

  const dateMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!dateMatch) return "Invalid date";

  const [, year, month, day] = dateMatch;
  return `${day}/${month}/${year}`;
};

const QuoteLocationWithCountry = ({ country }: { country?: string }) => {
  if (!country) {
    return <span>N/A</span>;
  }

  const normalizedCountry = normalizeCountryCode(country);
  const countryName = normalizedCountry
    ? countriesByCode[normalizedCountry] || country
    : country;

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
      <span>{countryName}</span>
    </div>
  );
};

export const QuoteHistorySubtable = ({
  products,
  services,
}: QuoteHistorySubtableProps) => {
  const productRows = Array.isArray(products) ? products : [];
  const serviceRows = Array.isArray(services) ? services : [];

  const allRows: TableRow[] = [
    ...productRows.map((item) => ({ type: "product" as const, data: item })),
    ...serviceRows.flatMap((service) => {
      if (
        service.serviceCategory === "Enrollment" &&
        service.enrolledDevices?.length
      ) {
        return service.enrolledDevices.map((device, idx) => ({
          type: "service" as const,
          serviceCategory: service.serviceCategory,
          data: device,
          index: idx,
          total: service.enrolledDevices!.length,
        })) as TableRow[];
      } else if (
        service.serviceCategory === "IT Support" &&
        service.productSnapshot
      ) {
        return [
          {
            type: "service" as const,
            serviceCategory: service.serviceCategory,
            data: service.productSnapshot,
            issues: service.issues,
            description: service.description,
            impactLevel: service.impactLevel,
            issueStartDate: service.issueStartDate,
          },
        ] as TableRow[];
      } else if (
        service.serviceCategory === "Buyback" &&
        service.products?.length
      ) {
        return service.products.map((product, idx) => ({
          type: "service" as const,
          serviceCategory: service.serviceCategory,
          data: product.productSnapshot,
          buybackDetails: product.buybackDetails,
          additionalInfo: service.additionalInfo,
          index: idx,
          total: service.products!.length,
        })) as TableRow[];
      } else if (
        service.serviceCategory === "Data Wipe" &&
        service.assets?.length
      ) {
        return service.assets.map((asset, idx) => ({
          type: "service" as const,
          serviceCategory: service.serviceCategory,
          data: asset.productSnapshot,
          dataWipeAsset: asset,
          additionalDetails: service.additionalDetails,
          index: idx,
          total: service.assets!.length,
        })) as TableRow[];
      } else if (
        service.serviceCategory === "Cleaning" &&
        service.products?.length
      ) {
        const cleaningProducts = service.products as Array<{
          productId: string;
          productSnapshot: any;
          desiredDate?: string;
          cleaningType?: string;
          additionalComments?: string;
        }>;
        return cleaningProducts.map((product, idx) => ({
          type: "service" as const,
          serviceCategory: "Cleaning" as const,
          data: product.productSnapshot,
          cleaningProduct: product,
          additionalDetails: service.additionalDetails,
          index: idx,
          total: cleaningProducts.length,
        })) as TableRow[];
      } else if (
        service.serviceCategory === "Donate" &&
        service.products?.length
      ) {
        const donateProducts = service.products as Array<{
          productId: string;
          productSnapshot: any;
          needsDataWipe?: boolean;
          needsCleaning?: boolean;
          comments?: string;
        }>;
        return donateProducts.map((product, idx) => ({
          type: "service" as const,
          serviceCategory: "Donate" as const,
          data: product.productSnapshot,
          donateProduct: product,
          additionalDetails: service.additionalDetails,
          index: idx,
          total: donateProducts.length,
        })) as TableRow[];
      } else if (
        service.serviceCategory === "Storage" &&
        service.products?.length
      ) {
        const storageProducts = service.products as Array<{
          productId: string;
          productSnapshot: any;
          approximateSize?: string;
          approximateWeight?: string;
          approximateStorageDays?: string;
          additionalComments?: string;
        }>;
        return storageProducts.map((product, idx) => ({
          type: "service" as const,
          serviceCategory: "Storage" as const,
          data: product.productSnapshot,
          storageProduct: product,
          additionalDetails: service.additionalDetails,
          index: idx,
          total: storageProducts.length,
        })) as TableRow[];
      } else if (
        service.serviceCategory === "Destruction and Recycling" &&
        service.products?.length
      ) {
        const destructionProducts = service.products as Array<{
          productId: string;
          productSnapshot: any;
        }>;
        return destructionProducts.map((product, idx) => ({
          type: "service" as const,
          serviceCategory: "Destruction and Recycling" as const,
          data: product.productSnapshot,
          destructionProduct: product,
          requiresCertificate: service.requiresCertificate,
          comments: service.comments,
          index: idx,
          total: destructionProducts.length,
        })) as TableRow[];
      } else if (
        service.serviceCategory === "Offboarding" &&
        service.products?.length
      ) {
        const offboardingProducts = service.products as Array<{
          productId: string;
          productSnapshot: any;
          destination?: any;
        }>;
        return offboardingProducts.map((product, idx) => ({
          type: "service" as const,
          serviceCategory: "Offboarding" as const,
          data: product.productSnapshot,
          offboardingProduct: product,
          originMember: service.originMember,
          isSensitiveSituation: service.isSensitiveSituation,
          employeeKnows: service.employeeKnows,
          desirablePickupDate: service.desirablePickupDate,
          additionalDetails: service.additionalDetails,
          index: idx,
          total: offboardingProducts.length,
        })) as TableRow[];
      } else if (
        service.serviceCategory === "Logistics" &&
        service.products?.length
      ) {
        const logisticsProducts = service.products as Array<{
          productId: string;
          productSnapshot: any;
          destination?: any;
        }>;
        return logisticsProducts.map((product, idx) => ({
          type: "service" as const,
          serviceCategory: "Logistics" as const,
          data: product.productSnapshot,
          logisticsProduct: product,
          desirablePickupDate: service.desirablePickupDate,
          additionalDetails: service.additionalDetails,
          index: idx,
          total: logisticsProducts.length,
        })) as TableRow[];
      }
      return [];
    }),
  ];

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-light-grey border-gray-200 rounded-md">
          <TableHead className="px-4 py-3 border-r w-24 font-semibold text-black text-start">
            Type
          </TableHead>
          <TableHead className="px-4 py-3 border-r w-32 font-semibold text-black text-start">
            Category
          </TableHead>
          <TableHead className="px-4 py-3 border-r w-24 font-semibold text-black text-start">
            Quantity
          </TableHead>
          <TableHead className="px-4 py-3 border-r w-64 font-semibold text-black text-start">
            Details
          </TableHead>
          <TableHead className="px-4 py-3 w-32 font-semibold text-black text-start">
            Required Delivery Date
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {allRows.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="h-20 text-xs text-center">
              No items found.
            </TableCell>
          </TableRow>
        ) : (
          allRows.map((row, index) => {
            const isProduct = row.type === "product";
            const isEnrollment =
              !isProduct &&
              "index" in row &&
              row.serviceCategory === "Enrollment";
            const isITSupport = !isProduct && "issues" in row;
            const isBuyback =
              !isProduct && "index" in row && row.serviceCategory === "Buyback";
            const isDataWipe =
              !isProduct &&
              "index" in row &&
              row.serviceCategory === "Data Wipe";
            const isCleaning =
              !isProduct &&
              "index" in row &&
              row.serviceCategory === "Cleaning";
            const isDonate =
              !isProduct && "index" in row && row.serviceCategory === "Donate";
            const isStorage =
              !isProduct && "index" in row && row.serviceCategory === "Storage";
            const isDestructionRecycling =
              !isProduct &&
              "index" in row &&
              row.serviceCategory === "Destruction and Recycling";
            const isLogistics =
              !isProduct &&
              "index" in row &&
              row.serviceCategory === "Logistics";
            const isOffboarding =
              !isProduct &&
              "index" in row &&
              row.serviceCategory === "Offboarding";

            return (
              <TableRow key={index}>
                <TableCell className="px-4 py-2 border-r w-24 text-xs">
                  {isProduct ? "Product" : "Service"}
                </TableCell>
                <TableCell className="px-4 py-2 border-r w-32 text-xs">
                  {isProduct
                    ? (row as any).data.category || "N/A"
                    : (row as any).serviceCategory || "N/A"}
                </TableCell>
                <TableCell className="px-4 py-2 border-r w-24 text-xs">
                  {isProduct ? (row as any).data.quantity ?? 0 : "1"}
                </TableCell>
                <TableCell className="px-4 py-2 border-r w-64 text-xs">
                  <div className="flex flex-col gap-1">
                    {isProduct ? (
                      <>
                        <QuoteLocationWithCountry
                          country={(row as any).data.country}
                        />
                      </>
                    ) : isEnrollment ? (
                      <>
                        <span className="font-semibold">
                          {(row as any).data.category}
                        </span>
                        {formatBrandModelName((row as any).data)}
                        {(row as any).data.serialNumber && (
                          <span className="text-gray-600">
                            SN: {(row as any).data.serialNumber}
                          </span>
                        )}
                        <div className="flex flex-col gap-0.5">
                          <span className="text-gray-600 text-xs">
                            Location:
                          </span>
                          <QuoteLocationBlock
                            variant="location"
                            data={{
                              location: (row as any).data.location,
                              assignedTo: (row as any).data.assignedTo,
                              countryCode: (row as any).data.countryCode,
                            }}
                          />
                        </div>
                      </>
                    ) : isITSupport ? (
                      <>
                        <span className="font-semibold">
                          {(row as any).data.category}
                        </span>
                        {formatBrandModelName((row as any).data)}
                        {(row as any).data.serialNumber && (
                          <span className="text-gray-600">
                            SN: {(row as any).data.serialNumber}
                          </span>
                        )}
                        <div className="flex flex-col gap-0.5">
                          <span className="text-gray-600 text-xs">
                            Location:
                          </span>
                          <QuoteLocationBlock
                            variant="location"
                            data={{
                              location: (row as any).data.location,
                              assignedTo: (row as any).data.assignedTo,
                              countryCode: (row as any).data.countryCode,
                            }}
                          />
                        </div>
                        {(row as any).impactLevel && (
                          <span className="text-gray-600">
                            Impact level: {(row as any).impactLevel}
                          </span>
                        )}
                        {(row as any).issues && (row as any).issues.length > 0 && (
                          <span className="text-gray-600 text-xs">
                            Issues: {(row as any).issues.join(", ")}
                          </span>
                        )}
                        {(row as any).issueStartDate && (
                          <span className="text-gray-600 text-xs">
                            Started: {formatDate((row as any).issueStartDate)}
                          </span>
                        )}
                      </>
                    ) : isBuyback ? (
                      <>
                        <span className="font-semibold">
                          {(row as any).data.category}
                        </span>
                        {formatBrandModelName((row as any).data)}
                        {(row as any).data.serialNumber && (
                          <span className="text-gray-600">
                            SN: {(row as any).data.serialNumber}
                          </span>
                        )}
                        <div className="flex flex-col gap-0.5">
                          <span className="text-gray-600 text-xs">
                            Location:
                          </span>
                          <QuoteLocationBlock
                            variant="location"
                            data={{
                              location: (row as any).data.location,
                              assignedTo: (row as any).data.assignedTo,
                              countryCode: (row as any).data.countryCode,
                            }}
                          />
                        </div>
                        {(row as any).buybackDetails && (
                          <>
                            {(row as any).buybackDetails.generalFunctionality && (
                              <span className="text-gray-600 text-xs">
                                Overall condition:{" "}
                                {(row as any).buybackDetails.generalFunctionality}
                              </span>
                            )}
                            {(row as any).buybackDetails.batteryCycles !== undefined && (
                              <span className="text-gray-600 text-xs">
                                Battery:{" "}
                                {(row as any).buybackDetails.batteryCycles}
                              </span>
                            )}
                            {(row as any).buybackDetails.aestheticDetails && (
                              <span className="text-gray-600 text-xs">
                                Cosmetic:{" "}
                                {(row as any).buybackDetails.aestheticDetails}
                              </span>
                            )}
                            {(row as any).buybackDetails.hasCharger && (
                              <span className="text-gray-600 text-xs">
                                Charger: Has charger
                                {(row as any).buybackDetails.chargerWorks !== undefined &&
                                  ` (${(row as any).buybackDetails.chargerWorks ? "Works" : "Doesn't work"})`}
                              </span>
                            )}
                          </>
                        )}
                      </>
                    ) : isDataWipe ? (
                      <>
                        <span className="font-semibold">
                          {(row as any).data.category}
                        </span>
                        {formatBrandModelName((row as any).data)}
                        {(row as any).data.serialNumber && (
                          <span className="text-gray-600">
                            SN: {(row as any).data.serialNumber}
                          </span>
                        )}
                        <div className="flex flex-col gap-0.5">
                          <span className="text-gray-600 text-xs">
                            Location:
                          </span>
                          <QuoteLocationBlock
                            variant="location"
                            data={{
                              location: (row as any).data.location,
                              assignedTo: (row as any).data.assignedTo,
                              countryCode: (row as any).data.countryCode,
                            }}
                          />
                        </div>
                        {(row as any).dataWipeAsset?.destination && (
                          <>
                            <span className="text-gray-600 text-xs">
                              Return destination:
                            </span>
                            <QuoteLocationBlock
                              variant="destination"
                              data={(row as any).dataWipeAsset.destination}
                            />
                          </>
                        )}
                      </>
                    ) : isCleaning ? (
                      <>
                        <span className="font-semibold">
                          {(row as any).data.category}
                        </span>
                        {formatBrandModelName((row as any).data)}
                        {(row as any).data.serialNumber && (
                          <span className="text-gray-600">
                            SN: {(row as any).data.serialNumber}
                          </span>
                        )}
                        <div className="flex flex-col gap-0.5">
                          <span className="text-gray-600 text-xs">
                            Location:
                          </span>
                          <QuoteLocationBlock
                            variant="location"
                            data={{
                              location: (row as any).data.location,
                              assignedTo: (row as any).data.assignedTo,
                              countryCode: (row as any).data.countryCode,
                            }}
                          />
                        </div>
                        {(row as any).cleaningProduct?.cleaningType && (
                          <span className="text-gray-600">
                            {(row as any).cleaningProduct.cleaningType} Cleaning
                          </span>
                        )}
                      </>
                    ) : isDonate ? (
                      <>
                        <span className="font-semibold">
                          {(row as any).data.category}
                        </span>
                        {formatBrandModelName((row as any).data)}
                        {(row as any).data.serialNumber && (
                          <span className="text-gray-600">
                            SN: {(row as any).data.serialNumber}
                          </span>
                        )}
                        <div className="flex flex-col gap-0.5">
                          <span className="text-gray-600 text-xs">
                            Location:
                          </span>
                          <QuoteLocationBlock
                            variant="location"
                            data={{
                              location: (row as any).data.location,
                              assignedTo: (row as any).data.assignedTo,
                              countryCode: (row as any).data.countryCode,
                            }}
                          />
                        </div>
                        {((row as any).donateProduct?.needsDataWipe ||
                          (row as any).donateProduct?.needsCleaning) && (
                          <>
                            {(row as any).donateProduct?.needsDataWipe && (
                              <span className="text-gray-600 text-xs">
                                ✓ Needs Data Wipe
                              </span>
                            )}
                            {(row as any).donateProduct?.needsCleaning && (
                              <span className="text-gray-600 text-xs">
                                ✓ Needs Cleaning
                              </span>
                            )}
                          </>
                        )}
                      </>
                    ) : isStorage ? (
                      <>
                        <span className="font-semibold">
                          {(row as any).data.category}
                        </span>
                        {formatBrandModelName((row as any).data)}
                        {(row as any).data.serialNumber && (
                          <span className="text-gray-600">
                            SN: {(row as any).data.serialNumber}
                          </span>
                        )}
                        <div className="flex flex-col gap-0.5">
                          <span className="text-gray-600 text-xs">
                            Location:
                          </span>
                          <QuoteLocationBlock
                            variant="location"
                            data={{
                              location: (row as any).data.location,
                              assignedTo: (row as any).data.assignedTo,
                              countryCode: (row as any).data.countryCode,
                            }}
                          />
                        </div>
                        {(row as any).storageProduct?.approximateSize && (
                          <span className="text-gray-600 text-xs">
                            Size: {(row as any).storageProduct.approximateSize}
                          </span>
                        )}
                        {(row as any).storageProduct?.approximateWeight && (
                          <span className="text-gray-600 text-xs">
                            Weight:{" "}
                            {(row as any).storageProduct.approximateWeight}
                          </span>
                        )}
                        {(row as any).storageProduct
                          ?.approximateStorageDays && (
                          <span className="text-gray-600 text-xs">
                            Duration:{" "}
                            {(row as any).storageProduct.approximateStorageDays}
                          </span>
                        )}
                      </>
                    ) : isDestructionRecycling ? (
                      <>
                        <span className="font-semibold">
                          {(row as any).data.category}
                        </span>
                        {formatBrandModelName((row as any).data)}
                        {(row as any).data.serialNumber && (
                          <span className="text-gray-600">
                            SN: {(row as any).data.serialNumber}
                          </span>
                        )}
                        <div className="flex flex-col gap-0.5">
                          <span className="text-gray-600 text-xs">
                            Location:
                          </span>
                          <QuoteLocationBlock
                            variant="location"
                            data={{
                              location: (row as any).data.location,
                              assignedTo: (row as any).data.assignedTo,
                              countryCode: (row as any).data.countryCode,
                            }}
                          />
                        </div>
                        {(row as any).requiresCertificate && (
                          <span className="text-gray-600">
                            ✓ Certificate Required
                          </span>
                        )}
                      </>
                    ) : isOffboarding ? (
                      <>
                        <span className="font-semibold">
                          {(row as any).data?.category}
                        </span>
                        {formatBrandModelName((row as any).data)}
                        {(row as any).data?.serialNumber && (
                          <span className="text-gray-600">
                            SN: {(row as any).data.serialNumber}
                          </span>
                        )}
                        {!("originMember" in row && (row as any).originMember) && (
                          <div className="flex flex-col gap-0.5">
                            <span className="text-gray-600 text-xs">
                              Location:
                            </span>
                            <QuoteLocationBlock
                              variant="location"
                              data={{
                                location: (row as any).data?.location,
                                assignedTo: (row as any).data?.assignedTo,
                                countryCode: (row as any).data?.countryCode,
                              }}
                            />
                          </div>
                        )}
                        {"originMember" in row && (row as any).originMember && (
                          <>
                            <span className="text-gray-600 text-xs">
                              From:{" "}
                            </span>
                            <QuoteLocationBlock
                              variant="location"
                              data={{
                                assignedTo: `${(row as any).originMember.firstName || ""} ${(row as any).originMember.lastName || ""}`.trim(),
                                countryCode: (row as any).originMember.countryCode,
                              }}
                            />
                          </>
                        )}
                        {"offboardingProduct" in row &&
                          (row as any).offboardingProduct?.destination && (
                            <>
                              <span className="text-gray-600 text-xs">
                                To:{" "}
                              </span>
                              <QuoteLocationBlock
                                variant="destination"
                                data={(row as any).offboardingProduct.destination}
                              />
                            </>
                          )}
                        {"isSensitiveSituation" in row &&
                          (row as any).isSensitiveSituation && (
                            <span className="text-gray-600 text-xs">
                              Sensitive situation: Yes
                            </span>
                          )}
                        {"employeeKnows" in row &&
                          (row as any).employeeKnows !== undefined && (
                            <span className="text-gray-600 text-xs">
                              Employee knows:{" "}
                              {(row as any).employeeKnows ? "Yes" : "No"}
                            </span>
                          )}
                      </>
                    ) : isLogistics ? (
                      <>
                        <span className="font-semibold">
                          {(row as any).data.category}
                        </span>
                        {formatBrandModelName((row as any).data)}
                        {(row as any).data.serialNumber && (
                          <span className="text-gray-600">
                            SN: {(row as any).data.serialNumber}
                          </span>
                        )}
                        <span className="text-gray-600 text-xs">
                          From:{" "}
                        </span>
                        <QuoteLocationBlock
                          variant="location"
                          data={{
                            location: (row as any).data.location,
                            assignedTo: (row as any).data.assignedTo,
                            countryCode: (row as any).data.countryCode,
                          }}
                        />
                        {(row as any).logisticsProduct?.destination && (
                          <>
                            <span className="text-gray-600 text-xs">
                              Destination:{" "}
                            </span>
                            <QuoteLocationBlock
                              variant="destination"
                              data={(row as any).logisticsProduct.destination}
                            />
                          </>
                        )}
                      </>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell className="px-4 py-2 w-32 text-xs">
                  {isProduct
                    ? formatDate((row as any).data.deliveryDate)
                    : isDataWipe && (row as any).dataWipeAsset?.desirableDate
                    ? formatDate((row as any).dataWipeAsset.desirableDate)
                    : isCleaning && (row as any).cleaningProduct?.desiredDate
                    ? formatDate((row as any).cleaningProduct.desiredDate)
                    : isOffboarding && (row as any).desirablePickupDate
                    ? formatDate((row as any).desirablePickupDate)
                    : isLogistics && (row as any).desirablePickupDate
                    ? formatDate((row as any).desirablePickupDate)
                    : "N/A"}
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
};
