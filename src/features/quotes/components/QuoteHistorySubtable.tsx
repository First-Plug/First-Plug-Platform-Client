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
                  {isProduct ? ((row as any).data.quantity ?? 0) : "1"}
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
                        {((row as any).data.brand ||
                          (row as any).data.model) && (
                          <span className="text-gray-700">
                            {(row as any).data.brand}
                            {(row as any).data.brand &&
                              (row as any).data.model &&
                              " - "}
                            {(row as any).data.model}
                          </span>
                        )}
                        {(row as any).data.name && (
                          <span className="text-gray-600 italic">
                            {(row as any).data.name}
                          </span>
                        )}
                        <span className="text-gray-600">
                          SN: {(row as any).data.serialNumber}
                        </span>
                        <span className="text-gray-600">
                          {(row as any).data.assignedTo} (
                          {(row as any).data.location})
                        </span>
                        <QuoteLocationWithCountry
                          country={(row as any).data.countryCode}
                        />
                        {(row as any).data.additionalDetails && (
                          <span className="text-gray-500 text-xs italic">
                            {(row as any).data.additionalDetails}
                          </span>
                        )}
                      </>
                    ) : isITSupport ? (
                      <>
                        <span className="font-semibold">
                          {(row as any).data.category}
                        </span>
                        {((row as any).data.brand ||
                          (row as any).data.model) && (
                          <span className="text-gray-700">
                            {(row as any).data.brand}
                            {(row as any).data.brand &&
                              (row as any).data.model &&
                              " - "}
                            {(row as any).data.model}
                          </span>
                        )}
                        {(row as any).data.name && (
                          <span className="text-gray-600 italic">
                            {(row as any).data.name}
                          </span>
                        )}
                        <span className="text-gray-600">
                          SN: {(row as any).data.serialNumber}
                        </span>
                        <span className="text-gray-600">
                          {(row as any).data.assignedTo} (
                          {(row as any).data.location})
                        </span>
                        <QuoteLocationWithCountry
                          country={(row as any).data.countryCode}
                        />
                        {(row as any).issues &&
                          (row as any).issues.length > 0 && (
                            <>
                              <span className="text-gray-600">
                                Issues: {(row as any).issues.join(", ")}
                              </span>
                              {(row as any).issueStartDate && (
                                <span className="text-gray-600">
                                  Started:{" "}
                                  {formatDate((row as any).issueStartDate)}
                                </span>
                              )}
                            </>
                          )}
                      </>
                    ) : isBuyback ? (
                      <>
                        <span className="font-semibold">
                          {(row as any).data.category}
                        </span>
                        {((row as any).data.brand ||
                          (row as any).data.model) && (
                          <span className="text-gray-700">
                            {(row as any).data.brand}
                            {(row as any).data.brand &&
                              (row as any).data.model &&
                              " - "}
                            {(row as any).data.model}
                          </span>
                        )}
                        {(row as any).data.name && (
                          <span className="text-gray-600 italic">
                            {(row as any).data.name}
                          </span>
                        )}
                        {(row as any).data.serialNumber && (
                          <span className="text-gray-600">
                            SN: {(row as any).data.serialNumber}
                          </span>
                        )}
                        <span className="text-gray-600">
                          {(row as any).data.assignedTo} (
                          {(row as any).data.location})
                        </span>
                        <QuoteLocationWithCountry
                          country={(row as any).data.countryCode}
                        />
                        {(row as any).buybackDetails && (
                          <div className="space-y-0.5 mt-1 pt-1 border-gray-200 border-t">
                            {(row as any).buybackDetails
                              .generalFunctionality && (
                              <span className="block text-gray-500 text-xs">
                                <span className="font-medium">
                                  Overall condition:{" "}
                                </span>
                                {
                                  (row as any).buybackDetails
                                    .generalFunctionality
                                }
                              </span>
                            )}
                            {(row as any).buybackDetails.batteryCycles !==
                              undefined && (
                              <span className="block text-gray-500 text-xs">
                                <span className="font-medium">
                                  Battery cycles:{" "}
                                </span>
                                {(row as any).buybackDetails.batteryCycles}
                              </span>
                            )}
                            {(row as any).buybackDetails.aestheticDetails && (
                              <span className="block text-gray-500 text-xs">
                                <span className="font-medium">
                                  Cosmetic condition:{" "}
                                </span>
                                {(row as any).buybackDetails.aestheticDetails}
                              </span>
                            )}
                            {(row as any).buybackDetails.hasCharger !==
                              undefined && (
                              <span className="block text-gray-500 text-xs">
                                <span className="font-medium">
                                  Has charger:{" "}
                                </span>
                                {(row as any).buybackDetails.hasCharger
                                  ? "Yes"
                                  : "No"}
                                {(row as any).buybackDetails.hasCharger &&
                                  (row as any).buybackDetails.chargerWorks !==
                                    undefined && (
                                    <span>
                                      {" "}
                                      (
                                      {(row as any).buybackDetails.chargerWorks
                                        ? "Works"
                                        : "Doesn't work"}
                                      )
                                    </span>
                                  )}
                              </span>
                            )}
                            {(row as any).buybackDetails.additionalComments && (
                              <span className="block text-gray-500 text-xs">
                                <span className="font-medium">
                                  Additional details:{" "}
                                </span>
                                {(row as any).buybackDetails.additionalComments}
                              </span>
                            )}
                          </div>
                        )}
                        {(row as any).additionalInfo &&
                          (row as any).index === 0 && (
                            <div className="mt-1 pt-1 border-gray-200 border-t">
                              <span className="block text-gray-500 text-xs italic">
                                <span className="font-medium">
                                  Additional info:{" "}
                                </span>
                                {(row as any).additionalInfo}
                              </span>
                            </div>
                          )}
                      </>
                    ) : isDataWipe ? (
                      <>
                        <span className="font-semibold">
                          {(row as any).data.category}
                        </span>
                        {((row as any).data.brand ||
                          (row as any).data.model) && (
                          <span className="text-gray-700">
                            {(row as any).data.brand}
                            {(row as any).data.brand &&
                              (row as any).data.model &&
                              " - "}
                            {(row as any).data.model}
                          </span>
                        )}
                        {(row as any).data.name && (
                          <span className="text-gray-600 italic">
                            {(row as any).data.name}
                          </span>
                        )}
                        {(row as any).data.serialNumber && (
                          <span className="text-gray-600">
                            SN: {(row as any).data.serialNumber}
                          </span>
                        )}
                        <span className="text-gray-600">
                          {(row as any).data.assignedTo} (
                          {(row as any).data.location})
                        </span>
                        <QuoteLocationWithCountry
                          country={(row as any).data.countryCode}
                        />
                        {(row as any).dataWipeAsset && (
                          <div className="space-y-0.5 mt-1 pt-1 border-gray-200 border-t">
                            {(row as any).dataWipeAsset.desirableDate && (
                              <span className="block text-gray-500 text-xs">
                                <span className="font-medium">
                                  Desirable date:{" "}
                                </span>
                                {formatDate(
                                  (row as any).dataWipeAsset.desirableDate
                                )}
                              </span>
                            )}
                            {(row as any).dataWipeAsset.currentLocation && (
                              <span className="block text-gray-500 text-xs">
                                <span className="font-medium">
                                  Current location:{" "}
                                </span>
                                {(row as any).dataWipeAsset.currentLocation}
                              </span>
                            )}
                            {(row as any).dataWipeAsset.currentMember && (
                              <span className="block text-gray-500 text-xs">
                                <span className="font-medium">
                                  Current member:{" "}
                                </span>
                                {
                                  (row as any).dataWipeAsset.currentMember
                                    .assignedMember
                                }
                                {(row as any).dataWipeAsset.currentMember
                                  .assignedEmail &&
                                  ` (${(row as any).dataWipeAsset.currentMember.assignedEmail})`}
                              </span>
                            )}
                            {(row as any).dataWipeAsset.currentOffice && (
                              <span className="block text-gray-500 text-xs">
                                <span className="font-medium">
                                  Current office:{" "}
                                </span>
                                {
                                  (row as any).dataWipeAsset.currentOffice
                                    .officeName
                                }
                                {(row as any).dataWipeAsset.currentOffice
                                  .countryCode && (
                                  <>
                                    {" "}
                                    <QuoteLocationWithCountry
                                      country={
                                        (row as any).dataWipeAsset.currentOffice
                                          .countryCode
                                      }
                                    />
                                  </>
                                )}
                              </span>
                            )}
                            {(row as any).dataWipeAsset.currentWarehouse && (
                              <span className="block text-gray-500 text-xs">
                                <span className="font-medium">
                                  Current warehouse:{" "}
                                </span>
                                FP warehouse
                                {(row as any).dataWipeAsset.currentWarehouse
                                  .countryCode && (
                                  <>
                                    {" "}
                                    <QuoteLocationWithCountry
                                      country={
                                        (row as any).dataWipeAsset
                                          .currentWarehouse.countryCode
                                      }
                                    />
                                  </>
                                )}
                              </span>
                            )}
                            {(row as any).dataWipeAsset.destination && (
                              <span className="block text-gray-500 text-xs">
                                <span className="font-medium">
                                  Return destination:{" "}
                                </span>
                                {(row as any).dataWipeAsset.destination
                                  .destinationType === "Employee" &&
                                  (row as any).dataWipeAsset.destination
                                    .member && (
                                    <span>
                                      {
                                        (row as any).dataWipeAsset.destination
                                          .member.assignedMember
                                      }
                                      {(row as any).dataWipeAsset.destination
                                        .member.assignedEmail &&
                                        ` (${(row as any).dataWipeAsset.destination.member.assignedEmail})`}
                                    </span>
                                  )}
                                {(row as any).dataWipeAsset.destination
                                  .destinationType === "Our office" &&
                                  (row as any).dataWipeAsset.destination
                                    .office && (
                                    <span>
                                      {
                                        (row as any).dataWipeAsset.destination
                                          .office.officeName
                                      }
                                    </span>
                                  )}
                                {(row as any).dataWipeAsset.destination
                                  .destinationType === "FP warehouse" && (
                                  <span>FP warehouse</span>
                                )}
                              </span>
                            )}
                          </div>
                        )}
                        {(row as any).additionalDetails &&
                          (row as any).index === 0 && (
                            <div className="mt-1 pt-1 border-gray-200 border-t">
                              <span className="block text-gray-500 text-xs italic">
                                <span className="font-medium">
                                  Additional details:{" "}
                                </span>
                                {(row as any).additionalDetails}
                              </span>
                            </div>
                          )}
                      </>
                    ) : isCleaning ? (
                      <>
                        <span className="font-semibold">
                          {(row as any).data.category}
                        </span>
                        {((row as any).data.brand ||
                          (row as any).data.model) && (
                          <span className="text-gray-700">
                            {(row as any).data.brand}
                            {(row as any).data.brand &&
                              (row as any).data.model &&
                              " - "}
                            {(row as any).data.model}
                          </span>
                        )}
                        {(row as any).data.name && (
                          <span className="text-gray-600 italic">
                            {(row as any).data.name}
                          </span>
                        )}
                        {(row as any).data.serialNumber && (
                          <span className="text-gray-600">
                            SN: {(row as any).data.serialNumber}
                          </span>
                        )}
                        <span className="text-gray-600">
                          {(row as any).data.assignedTo} (
                          {(row as any).data.location})
                        </span>
                        <QuoteLocationWithCountry
                          country={(row as any).data.countryCode}
                        />
                        {(row as any).cleaningProduct?.cleaningType && (
                          <span className="block text-gray-600">
                            {(row as any).cleaningProduct.cleaningType} Cleaning
                          </span>
                        )}
                        {(row as any).additionalDetails && (
                            <div className="mt-1 pt-1 border-gray-200 border-t">
                              <span className="block text-gray-500 text-xs italic">
                                <span className="font-medium">
                                  Additional details:{" "}
                                </span>
                                {(row as any).additionalDetails}
                              </span>
                            </div>
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
