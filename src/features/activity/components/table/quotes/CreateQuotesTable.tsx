import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/shared";
import { QuoteLocationWithCountry } from "./QuoteLocationWithCountry";
import { QuoteLocationBlock } from "@/features/quotes/components/QuoteLocationBlock";
import { formatBrandModelName } from "@/features/quotes/utils/quoteDisplayFormatters";

const formatDateString = (date?: string) => {
  if (!date) return "N/A";

  const dateMatch = date.match(/^(\d{4})[-\/](\d{2})[-\/](\d{2})/);
  if (!dateMatch) return "Invalid date";

  const [, year, month, day] = dateMatch;
  return `${day}/${month}/${year}`;
};

interface QuoteProduct {
  category: string;
  quantity: number;
  country: string;
  deliveryDate?: string;
}

interface EnrolledDevice {
  category?: string;
  name?: string;
  brand?: string;
  model?: string;
  serialNumber: string;
  location: string;
  assignedTo: string;
  countryCode: string;
}

interface DataWipeAsset {
  productId: string;
  productSnapshot: {
    category?: string;
    name?: string;
    brand?: string;
    model?: string;
    serialNumber: string;
    location: string;
    assignedTo: string;
    countryCode: string;
  };
  desirableDate?: string;
  currentMember?: {
    memberId?: string;
    assignedMember: string;
    assignedEmail?: string;
    countryCode: string;
  };
  destination?: {
    destinationType?: string;
    member?: {
      memberId: string;
      assignedMember: string;
      assignedEmail?: string;
      countryCode: string;
    };
    office?: {
      officeId: string;
      officeName: string;
      countryCode: string;
    };
    warehouse?: {
      warehouseName: string;
      countryCode: string;
    };
  };
}

interface DestructionProduct {
  productId: string;
  productSnapshot: {
    category?: string;
    name?: string;
    brand?: string;
    model?: string;
    serialNumber: string;
    location: string;
    assignedTo: string;
    countryCode: string;
  };
}

interface BuybackProduct {
  productId: string;
  productSnapshot: {
    category?: string;
    name?: string;
    brand?: string;
    model?: string;
    serialNumber: string;
    location: string;
    assignedTo: string;
    countryCode: string;
  };
  buybackDetails?: {
    generalFunctionality?: string;
    batteryCycles?: number;
    aestheticDetails?: string;
    hasCharger?: boolean;
    chargerWorks?: boolean;
    additionalComments?: string;
  };
}

interface DonateProduct {
  productId: string;
  productSnapshot: {
    category?: string;
    name?: string;
    brand?: string;
    model?: string;
    serialNumber: string;
    location: string;
    assignedTo: string;
    countryCode: string;
  };
  needsDataWipe?: boolean;
  needsCleaning?: boolean;
  comments?: string;
}

interface CleaningProduct {
  productId: string;
  productSnapshot: {
    category?: string;
    name?: string;
    brand?: string;
    model?: string;
    serialNumber: string;
    location: string;
    assignedTo: string;
    assignedEmail?: string;
    countryCode: string;
  };
  desiredDate?: string;
  cleaningType?: string;
}

interface StorageProduct {
  productId: string;
  productSnapshot: {
    category?: string;
    name?: string;
    brand?: string;
    model?: string;
    serialNumber: string;
    location: string;
    assignedTo: string;
    assignedEmail?: string;
    countryCode: string;
  };
  approximateSize?: string;
  approximateWeight?: string;
  approximateStorageDays?: number;
  additionalComments?: string;
}

interface OffboardingProduct {
  productId: string;
  productSnapshot: {
    category?: string;
    name?: string;
    brand?: string;
    model?: string;
    serialNumber: string;
    location: string;
    assignedTo: string;
    assignedEmail?: string;
    countryCode: string;
  };
  destination: {
    type: "Member" | "Office" | "Warehouse";
    memberId?: string;
    assignedMember?: string;
    assignedEmail?: string;
    officeId?: string;
    officeName?: string;
    warehouseId?: string;
    warehouseName?: string;
    countryCode: string;
  };
}

interface OffboardingService {
  originMember: {
    memberId: string;
    firstName: string;
    lastName: string;
    email: string;
    countryCode: string;
  };
  isSensitiveSituation?: boolean;
  employeeKnows?: boolean;
  desirablePickupDate?: string;
}

interface LogisticsProduct {
  productId: string;
  productSnapshot: {
    category?: string;
    name?: string;
    brand?: string;
    model?: string;
    serialNumber: string;
    location: string;
    assignedTo: string;
    assignedEmail?: string;
    countryCode: string;
  };
  destination: {
    type: "Member" | "Office" | "Warehouse";
    memberId?: string;
    assignedMember?: string;
    assignedEmail?: string;
    officeId?: string;
    officeName?: string;
    warehouseId?: string;
    warehouseName?: string;
    countryCode: string;
  };
}

interface QuoteService {
  serviceCategory: string;
  issues?: string[];
  description?: string;
  impactLevel?: string;
  issueStartDate?: string;
  productSnapshot?: {
    category?: string;
    name?: string;
    brand?: string;
    model?: string;
    serialNumber: string;
    location: string;
    assignedTo: string;
    countryCode: string;
  };
  enrolledDevices?: EnrolledDevice[];
  assets?: DataWipeAsset[];
  products?:
    | DestructionProduct[]
    | BuybackProduct[]
    | DonateProduct[]
    | CleaningProduct[]
    | StorageProduct[]
    | OffboardingProduct[]
    | LogisticsProduct[];
  originMember?: OffboardingService["originMember"];
  isSensitiveSituation?: boolean;
  employeeKnows?: boolean;
  desirablePickupDate?: string;
  requiresCertificate?: boolean;
  comments?: string;
  additionalInfo?: string;
  additionalDetails?: string;
}

interface Quote {
  requestId: string;
  products?: QuoteProduct[];
  services?: QuoteService[];
}

interface CreateQuotesTableProps {
  data: Quote | Quote[];
}

const CreateQuotesTable: React.FC<CreateQuotesTableProps> = ({ data }) => {
  const normalizedData: Quote[] = Array.isArray(data) ? data : [data];

  // Flatten products and services with their quote ID
  const flattenedRows = normalizedData.flatMap((quote) => {
    const rows: any[] = [];

    // Add product rows
    if (quote.products && quote.products.length > 0) {
      quote.products.forEach((product) => {
        rows.push({
          quoteId: quote.requestId,
          type: "product",
          ...product,
        });
      });
    }

    // Add service rows
    if (quote.services && quote.services.length > 0) {
      quote.services.forEach((service) => {
        // For Enrollment, create a row for each enrolled device
        if (
          service.serviceCategory === "Enrollment" &&
          service.enrolledDevices &&
          service.enrolledDevices.length > 0
        ) {
          service.enrolledDevices.forEach((device) => {
            rows.push({
              quoteId: quote.requestId,
              type: "service",
              serviceCategory: service.serviceCategory,
              enrolledDevice: device,
              additionalDetails: service.additionalDetails,
            });
          });
        } else if (
          service.serviceCategory === "Data Wipe" &&
          service.assets &&
          service.assets.length > 0
        ) {
          // For Data Wipe, create a row for each asset
          service.assets.forEach((asset) => {
            rows.push({
              quoteId: quote.requestId,
              type: "service",
              serviceCategory: service.serviceCategory,
              dataWipeAsset: asset,
              additionalDetails: service.additionalDetails,
            });
          });
        } else if (
          service.serviceCategory === "Destruction and Recycling" &&
          service.products &&
          service.products.length > 0
        ) {
          // For Destruction and Recycling, create a row for each product
          service.products.forEach((product) => {
            rows.push({
              quoteId: quote.requestId,
              type: "service",
              serviceCategory: service.serviceCategory,
              destructionProduct: product,
              requiresCertificate: service.requiresCertificate,
              comments: service.comments,
            });
          });
        } else if (
          service.serviceCategory === "Buyback" &&
          service.products &&
          service.products.length > 0
        ) {
          // For Buyback, create a row for each product
          service.products.forEach((product) => {
            rows.push({
              quoteId: quote.requestId,
              type: "service",
              serviceCategory: service.serviceCategory,
              buybackProduct: product,
              additionalInfo: service.additionalInfo,
            });
          });
        } else if (
          service.serviceCategory === "Donate" &&
          service.products &&
          service.products.length > 0
        ) {
          // For Donate, create a row for each product
          service.products.forEach((product) => {
            rows.push({
              quoteId: quote.requestId,
              type: "service",
              serviceCategory: service.serviceCategory,
              donateProduct: product,
              additionalDetails: service.additionalDetails,
            });
          });
        } else if (
          service.serviceCategory === "Cleaning" &&
          service.products &&
          service.products.length > 0
        ) {
          // For Cleaning, create a row for each product
          service.products.forEach((product) => {
            rows.push({
              quoteId: quote.requestId,
              type: "service",
              serviceCategory: service.serviceCategory,
              cleaningProduct: product,
              additionalDetails: service.additionalDetails,
            });
          });
        } else if (
          service.serviceCategory === "Storage" &&
          service.products &&
          service.products.length > 0
        ) {
          // For Storage, create a row for each product
          service.products.forEach((product) => {
            rows.push({
              quoteId: quote.requestId,
              type: "service",
              serviceCategory: service.serviceCategory,
              storageProduct: product,
              additionalDetails: service.additionalDetails,
            });
          });
        } else if (
          service.serviceCategory === "Offboarding" &&
          service.products &&
          service.products.length > 0
        ) {
          // For Offboarding, create a row for each product
          service.products.forEach((product) => {
            rows.push({
              quoteId: quote.requestId,
              type: "service",
              serviceCategory: service.serviceCategory,
              offboardingProduct: product,
              originMember: service.originMember,
              isSensitiveSituation: service.isSensitiveSituation,
              employeeKnows: service.employeeKnows,
              desirablePickupDate: service.desirablePickupDate,
              additionalDetails: service.additionalDetails,
            });
          });
        } else if (
          service.serviceCategory === "Logistics" &&
          service.products &&
          service.products.length > 0
        ) {
          // For Logistics, create a row for each product
          service.products.forEach((product) => {
            rows.push({
              quoteId: quote.requestId,
              type: "service",
              serviceCategory: service.serviceCategory,
              logisticsProduct: product,
              desirablePickupDate: service.desirablePickupDate,
              additionalDetails: service.additionalDetails,
            });
          });
        } else {
          // For other services (IT Support, etc.)
          rows.push({
            quoteId: quote.requestId,
            type: "service",
            ...service,
          });
        }
      });
    }

    return rows;
  });

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-light-grey border-gray-200 rounded-md">
          <TableHead className="px-4 py-3 border-r w-40 font-semibold text-black text-start">
            Quote ID
          </TableHead>
          <TableHead className="px-4 py-3 border-r w-20 font-semibold text-black text-start">
            Type
          </TableHead>
          <TableHead className="px-4 py-3 border-r w-28 font-semibold text-black text-start">
            Category
          </TableHead>
          <TableHead className="px-4 py-3 border-r w-64 font-semibold text-black text-start">
            Details
          </TableHead>
          <TableHead className="px-4 py-3 w-28 font-semibold text-black text-start">
            Date
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {flattenedRows.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="h-24 text-center">
              No items found.
            </TableCell>
          </TableRow>
        ) : (
          flattenedRows.map((row, index) => (
            <TableRow key={index}>
              <TableCell className="px-4 py-2 border-r w-40 text-xs">
                {row.quoteId}
              </TableCell>
              <TableCell className="px-4 py-2 border-r w-20 text-xs capitalize">
                {row.type}
              </TableCell>

              {row.type === "product" ? (
                <>
                  <TableCell className="px-4 py-2 border-r w-28 text-xs">
                    {row.category}
                  </TableCell>
                  <TableCell className="px-4 py-2 border-r w-64 text-xs">
                    <div className="flex flex-col gap-1">
                      <span>Quantity: {row.quantity}</span>
                      <QuoteLocationWithCountry country={row.country} />
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-2 w-28 text-xs">
                    {formatDateString(row.deliveryDate)}
                  </TableCell>
                </>
              ) : (
                <>
                  <TableCell className="px-4 py-2 border-r w-28 text-xs">
                    {row.serviceCategory}
                  </TableCell>
                  <TableCell className="px-4 py-2 border-r w-64 text-xs">
                    <div className="flex flex-col gap-1">
                      {row.dataWipeAsset ? (
                        <>
                          {formatBrandModelName(row.dataWipeAsset.productSnapshot)}
                          {row.dataWipeAsset.productSnapshot.serialNumber && (
                            <span className="text-gray-600">
                              SN: {row.dataWipeAsset.productSnapshot.serialNumber}
                            </span>
                          )}
                          <div className="flex flex-col gap-0.5">
                            <span className="text-gray-600 text-xs">
                              Location:
                            </span>
                            <QuoteLocationBlock
                              variant="location"
                              data={{
                                location: row.dataWipeAsset.productSnapshot.location,
                                assignedTo: row.dataWipeAsset.productSnapshot.assignedTo,
                                countryCode: row.dataWipeAsset.productSnapshot.countryCode,
                              }}
                            />
                          </div>
                          {row.dataWipeAsset.destination && (
                            <>
                              <span className="text-gray-600 text-xs">
                                Return destination:{" "}
                              </span>
                              <QuoteLocationBlock
                                variant="destination"
                                data={row.dataWipeAsset.destination}
                              />
                            </>
                          )}
                        </>
                      ) : row.destructionProduct ? (
                        <>
                          <span className="font-semibold">
                            {row.destructionProduct.productSnapshot.category}
                          </span>
                          {formatBrandModelName(row.destructionProduct.productSnapshot)}
                          {row.destructionProduct.productSnapshot.serialNumber && (
                            <span className="text-gray-600">
                              SN:{" "}
                              {
                                row.destructionProduct.productSnapshot
                                  .serialNumber
                              }
                            </span>
                          )}
                          <div className="flex flex-col gap-0.5">
                            <span className="text-gray-600 text-xs">
                              Location:
                            </span>
                            <QuoteLocationBlock
                              variant="location"
                              data={{
                                location: row.destructionProduct.productSnapshot.location,
                                assignedTo: row.destructionProduct.productSnapshot.assignedTo,
                                countryCode: row.destructionProduct.productSnapshot.countryCode,
                              }}
                            />
                          </div>
                        </>
                      ) : row.buybackProduct ? (
                        <>
                          <span className="font-semibold">
                            {row.buybackProduct.productSnapshot.category}
                          </span>
                          {formatBrandModelName(row.buybackProduct.productSnapshot)}
                          {row.buybackProduct.productSnapshot.serialNumber && (
                            <span className="text-gray-600">
                              SN:{" "}
                              {row.buybackProduct.productSnapshot.serialNumber}
                            </span>
                          )}
                          <div className="flex flex-col gap-0.5">
                            <span className="text-gray-600 text-xs">
                              Location:
                            </span>
                            <QuoteLocationBlock
                              variant="location"
                              data={{
                                location: row.buybackProduct.productSnapshot.location,
                                assignedTo: row.buybackProduct.productSnapshot.assignedTo,
                                countryCode: row.buybackProduct.productSnapshot.countryCode,
                              }}
                            />
                          </div>
                        </>
                      ) : row.donateProduct ? (
                        <>
                          <span className="font-semibold">
                            {row.donateProduct.productSnapshot.category}
                          </span>
                          {formatBrandModelName(row.donateProduct.productSnapshot)}
                          {row.donateProduct.productSnapshot.serialNumber && (
                            <span className="text-gray-600">
                              SN: {row.donateProduct.productSnapshot.serialNumber}
                            </span>
                          )}
                          <div className="flex flex-col gap-0.5">
                            <span className="text-gray-600 text-xs">
                              Location:
                            </span>
                            <QuoteLocationBlock
                              variant="location"
                              data={{
                                location: row.donateProduct.productSnapshot.location,
                                assignedTo: row.donateProduct.productSnapshot.assignedTo,
                                countryCode: row.donateProduct.productSnapshot.countryCode,
                              }}
                            />
                          </div>
                        </>
                      ) : row.cleaningProduct ? (
                        <>
                          <span className="font-semibold">
                            {row.cleaningProduct.productSnapshot.category}
                          </span>
                          {formatBrandModelName(row.cleaningProduct.productSnapshot)}
                          {row.cleaningProduct.productSnapshot.serialNumber && (
                            <span className="text-gray-600">
                              SN:{" "}
                              {row.cleaningProduct.productSnapshot.serialNumber}
                            </span>
                          )}
                          <div className="flex flex-col gap-0.5">
                            <span className="text-gray-600 text-xs">
                              Location:
                            </span>
                            <QuoteLocationBlock
                              variant="location"
                              data={{
                                location: row.cleaningProduct.productSnapshot.location,
                                assignedTo: row.cleaningProduct.productSnapshot.assignedTo,
                                countryCode: row.cleaningProduct.productSnapshot.countryCode,
                              }}
                            />
                          </div>
                        </>
                      ) : row.storageProduct ? (
                        <>
                          <span className="font-semibold">
                            {row.storageProduct.productSnapshot.category}
                          </span>
                          {formatBrandModelName(row.storageProduct.productSnapshot)}
                          {row.storageProduct.productSnapshot.serialNumber && (
                            <span className="text-gray-600">
                              SN:{" "}
                              {row.storageProduct.productSnapshot.serialNumber}
                            </span>
                          )}
                          <div className="flex flex-col gap-0.5">
                            <span className="text-gray-600 text-xs">
                              Location:
                            </span>
                            <QuoteLocationBlock
                              variant="location"
                              data={{
                                location: row.storageProduct.productSnapshot.location,
                                assignedTo: row.storageProduct.productSnapshot.assignedTo,
                                countryCode: row.storageProduct.productSnapshot.countryCode,
                              }}
                            />
                          </div>
                        </>
                      ) : row.offboardingProduct ? (
                        <>
                          <span className="font-semibold">
                            {row.offboardingProduct.productSnapshot.category}
                          </span>
                          {formatBrandModelName(row.offboardingProduct.productSnapshot)}
                          {row.offboardingProduct.productSnapshot.serialNumber && (
                            <span className="text-gray-600">
                              SN:{" "}
                              {
                                row.offboardingProduct.productSnapshot
                                  .serialNumber
                              }
                            </span>
                          )}
                          {row.originMember && (
                            <>
                              <span className="text-gray-600 text-xs">
                                From:{" "}
                              </span>
                              <QuoteLocationBlock
                                variant="location"
                                data={{
                                  assignedTo: `${row.originMember.firstName || ""} ${row.originMember.lastName || ""}`.trim(),
                                  countryCode: row.originMember.countryCode,
                                }}
                              />
                            </>
                          )}
                          {row.offboardingProduct.destination && (
                            <>
                              <span className="text-gray-600 text-xs">
                                To:{" "}
                              </span>
                              <QuoteLocationBlock
                                variant="destination"
                                data={row.offboardingProduct.destination}
                              />
                            </>
                          )}
                        </>
                      ) : row.logisticsProduct ? (
                        <>
                          <span className="font-semibold">
                            {row.logisticsProduct.productSnapshot.category}
                          </span>
                          {formatBrandModelName(row.logisticsProduct.productSnapshot)}
                          {row.logisticsProduct.productSnapshot.serialNumber && (
                            <span className="text-gray-600">
                              SN:{" "}
                              {row.logisticsProduct.productSnapshot.serialNumber}
                            </span>
                          )}
                          <span className="text-gray-600 text-xs">
                            From:{" "}
                          </span>
                          <QuoteLocationBlock
                            variant="location"
                            data={{
                              location: row.logisticsProduct.productSnapshot.location,
                              assignedTo: row.logisticsProduct.productSnapshot.assignedTo,
                              countryCode: row.logisticsProduct.productSnapshot.countryCode,
                            }}
                          />
                          {row.logisticsProduct.destination && (
                            <>
                              <span className="text-gray-600 text-xs">
                                Destination:{" "}
                              </span>
                              <QuoteLocationBlock
                                variant="destination"
                                data={row.logisticsProduct.destination}
                              />
                            </>
                          )}
                        </>
                      ) : row.enrolledDevice ? (
                        <>
                          <span className="font-semibold">
                            {row.enrolledDevice.category}
                          </span>
                          {formatBrandModelName(row.enrolledDevice)}
                          {row.enrolledDevice.serialNumber && (
                            <span className="text-gray-600">
                              SN: {row.enrolledDevice.serialNumber}
                            </span>
                          )}
                          <div className="flex flex-col gap-0.5">
                            <span className="text-gray-600 text-xs">
                              Location:
                            </span>
                            <QuoteLocationBlock
                              variant="location"
                              data={{
                                location: row.enrolledDevice.location,
                                assignedTo: row.enrolledDevice.assignedTo,
                                countryCode: row.enrolledDevice.countryCode,
                              }}
                            />
                          </div>
                        </>
                      ) : row.productSnapshot ? (
                        <>
                          <span className="font-semibold">
                            {row.productSnapshot.category}
                          </span>
                          {formatBrandModelName(row.productSnapshot)}
                          {row.productSnapshot.serialNumber && (
                            <span className="text-gray-600">
                              SN: {row.productSnapshot.serialNumber}
                            </span>
                          )}
                          <div className="flex flex-col gap-0.5">
                            <span className="text-gray-600 text-xs">
                              Location:
                            </span>
                            <QuoteLocationBlock
                              variant="location"
                              data={{
                                location: row.productSnapshot.location,
                                assignedTo: row.productSnapshot.assignedTo,
                                countryCode: row.productSnapshot.countryCode,
                              }}
                            />
                          </div>
                        </>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-2 w-28 text-xs">
                    {row.productSnapshot && row.serviceCategory === "IT Support"
                      ? "N/A"
                      : row.dataWipeAsset
                        ? formatDateString(row.dataWipeAsset.desirableDate)
                        : row.cleaningProduct
                          ? formatDateString(row.cleaningProduct.desiredDate)
                          : row.offboardingProduct
                            ? formatDateString(row.desirablePickupDate)
                            : row.logisticsProduct
                              ? formatDateString(row.desirablePickupDate)
                              : formatDateString(row.issueStartDate)}
                  </TableCell>
                </>
              )}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default CreateQuotesTable;
