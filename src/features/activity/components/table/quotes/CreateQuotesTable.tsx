import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/shared";
import { QuoteLocationWithCountry } from "./QuoteLocationWithCountry";

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
  products?: DestructionProduct[] | BuybackProduct[];
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
                      <span>Qty: {row.quantity}</span>
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
                          <span className="font-semibold">
                            {row.dataWipeAsset.productSnapshot.category}
                          </span>
                          {(row.dataWipeAsset.productSnapshot.brand ||
                            row.dataWipeAsset.productSnapshot.model) && (
                            <span className="text-gray-700">
                              {row.dataWipeAsset.productSnapshot.brand}
                              {row.dataWipeAsset.productSnapshot.brand &&
                                row.dataWipeAsset.productSnapshot.model &&
                                " - "}
                              {row.dataWipeAsset.productSnapshot.model}
                            </span>
                          )}
                          {row.dataWipeAsset.productSnapshot.name && (
                            <span className="text-gray-600 italic">
                              {row.dataWipeAsset.productSnapshot.name}
                            </span>
                          )}
                          <span className="text-gray-600">
                            SN: {row.dataWipeAsset.productSnapshot.serialNumber}
                          </span>
                          {row.dataWipeAsset.currentMember ? (
                            <>
                              <span className="text-gray-600">
                                Current:{" "}
                                {row.dataWipeAsset.productSnapshot.location} -{" "}
                                {row.dataWipeAsset.currentMember.assignedMember}
                              </span>
                              {row.dataWipeAsset.currentMember.countryCode && (
                                <QuoteLocationWithCountry
                                  country={
                                    row.dataWipeAsset.currentMember.countryCode
                                  }
                                />
                              )}
                            </>
                          ) : (
                            <>
                              <span className="text-gray-600">
                                Current:{" "}
                                {row.dataWipeAsset.productSnapshot.location}
                              </span>
                              {row.dataWipeAsset.productSnapshot
                                .countryCode && (
                                <QuoteLocationWithCountry
                                  country={
                                    row.dataWipeAsset.productSnapshot
                                      .countryCode
                                  }
                                />
                              )}
                            </>
                          )}
                          {row.dataWipeAsset.destination?.warehouse && (
                            <>
                              <span className="text-gray-600 font-semibold mt-1">
                                New Location:
                              </span>
                              <span className="text-gray-600">
                                {
                                  row.dataWipeAsset.destination.warehouse
                                    .warehouseName
                                }
                              </span>
                              {row.dataWipeAsset.destination.warehouse
                                .countryCode && (
                                <QuoteLocationWithCountry
                                  country={
                                    row.dataWipeAsset.destination.warehouse
                                      .countryCode
                                  }
                                />
                              )}
                            </>
                          )}
                          {row.additionalDetails && (
                            <span className="text-gray-500 text-xs italic">
                              {row.additionalDetails}
                            </span>
                          )}
                        </>
                      ) : row.destructionProduct ? (
                        <>
                          <span className="font-semibold">
                            {row.destructionProduct.productSnapshot.category}
                          </span>
                          {(row.destructionProduct.productSnapshot.brand ||
                            row.destructionProduct.productSnapshot.model) && (
                            <span className="text-gray-700">
                              {row.destructionProduct.productSnapshot.brand}
                              {row.destructionProduct.productSnapshot.brand &&
                                row.destructionProduct.productSnapshot.model &&
                                " - "}
                              {row.destructionProduct.productSnapshot.model}
                            </span>
                          )}
                          {row.destructionProduct.productSnapshot.name && (
                            <span className="text-gray-600 italic">
                              {row.destructionProduct.productSnapshot.name}
                            </span>
                          )}
                          <span className="text-gray-600">
                            SN:{" "}
                            {
                              row.destructionProduct.productSnapshot
                                .serialNumber
                            }
                          </span>
                          <span className="text-gray-600">
                            {row.destructionProduct.productSnapshot.assignedTo}{" "}
                            ({row.destructionProduct.productSnapshot.location})
                          </span>
                          {row.destructionProduct.productSnapshot
                            .countryCode && (
                            <QuoteLocationWithCountry
                              country={
                                row.destructionProduct.productSnapshot
                                  .countryCode
                              }
                            />
                          )}
                          {row.requiresCertificate && (
                            <span className="text-gray-600 font-semibold">
                              ✓ Certificate Required
                            </span>
                          )}
                          {row.comments && (
                            <span className="text-gray-500 text-xs italic">
                              {row.comments}
                            </span>
                          )}
                        </>
                      ) : row.buybackProduct ? (
                        <>
                          <span className="font-semibold">
                            {row.buybackProduct.productSnapshot.category}
                          </span>
                          {(row.buybackProduct.productSnapshot.brand ||
                            row.buybackProduct.productSnapshot.model) && (
                            <span className="text-gray-700">
                              {row.buybackProduct.productSnapshot.brand}
                              {row.buybackProduct.productSnapshot.brand &&
                                row.buybackProduct.productSnapshot.model &&
                                " - "}
                              {row.buybackProduct.productSnapshot.model}
                            </span>
                          )}
                          {row.buybackProduct.productSnapshot.name && (
                            <span className="text-gray-600 italic">
                              {row.buybackProduct.productSnapshot.name}
                            </span>
                          )}
                          <span className="text-gray-600">
                            SN:{" "}
                            {row.buybackProduct.productSnapshot.serialNumber}
                          </span>
                          <span className="text-gray-600">
                            {row.buybackProduct.productSnapshot.assignedTo} (
                            {row.buybackProduct.productSnapshot.location})
                          </span>
                          {row.buybackProduct.productSnapshot.countryCode && (
                            <QuoteLocationWithCountry
                              country={
                                row.buybackProduct.productSnapshot.countryCode
                              }
                            />
                          )}
                          {row.buybackProduct.buybackDetails && (
                            <>
                              {row.buybackProduct.buybackDetails
                                .generalFunctionality && (
                                <span className="text-gray-600 text-xs">
                                  Functionality:{" "}
                                  {
                                    row.buybackProduct.buybackDetails
                                      .generalFunctionality
                                  }
                                </span>
                              )}
                              {row.buybackProduct.buybackDetails
                                .batteryCycles !== undefined && (
                                <span className="text-gray-600 text-xs">
                                  Battery Cycles:{" "}
                                  {
                                    row.buybackProduct.buybackDetails
                                      .batteryCycles
                                  }
                                </span>
                              )}
                              {row.buybackProduct.buybackDetails
                                .aestheticDetails && (
                                <span className="text-gray-600 text-xs">
                                  Aesthetic:{" "}
                                  {
                                    row.buybackProduct.buybackDetails
                                      .aestheticDetails
                                  }
                                </span>
                              )}
                              {row.buybackProduct.buybackDetails.hasCharger && (
                                <span className="text-gray-600 text-xs">
                                  ✓ Has Charger
                                  {row.buybackProduct.buybackDetails
                                    .chargerWorks && " (Works)"}
                                </span>
                              )}
                              {row.buybackProduct.buybackDetails
                                .additionalComments && (
                                <span className="text-gray-500 text-xs italic">
                                  {
                                    row.buybackProduct.buybackDetails
                                      .additionalComments
                                  }
                                </span>
                              )}
                            </>
                          )}
                          {row.additionalInfo && (
                            <span className="text-gray-500 text-xs italic">
                              {row.additionalInfo}
                            </span>
                          )}
                        </>
                      ) : row.enrolledDevice ? (
                        <>
                          <span className="font-semibold">
                            {row.enrolledDevice.category}
                          </span>
                          {(row.enrolledDevice.brand ||
                            row.enrolledDevice.model) && (
                            <span className="text-gray-700">
                              {row.enrolledDevice.brand}
                              {row.enrolledDevice.brand &&
                                row.enrolledDevice.model &&
                                " - "}
                              {row.enrolledDevice.model}
                            </span>
                          )}
                          {row.enrolledDevice.name && (
                            <span className="text-gray-600 italic">
                              {row.enrolledDevice.name}
                            </span>
                          )}
                          <span className="text-gray-600">
                            SN: {row.enrolledDevice.serialNumber}
                          </span>
                          <span className="text-gray-600">
                            {row.enrolledDevice.assignedTo} (
                            {row.enrolledDevice.location})
                          </span>
                          {row.enrolledDevice.countryCode && (
                            <QuoteLocationWithCountry
                              country={row.enrolledDevice.countryCode}
                            />
                          )}
                          {row.additionalDetails && (
                            <span className="text-gray-500 text-xs italic">
                              {row.additionalDetails}
                            </span>
                          )}
                        </>
                      ) : row.productSnapshot ? (
                        <>
                          <span className="font-semibold">
                            {row.productSnapshot.category}
                          </span>
                          {(row.productSnapshot.brand ||
                            row.productSnapshot.model) && (
                            <span className="text-gray-700">
                              {row.productSnapshot.brand}
                              {row.productSnapshot.brand &&
                                row.productSnapshot.model &&
                                " - "}
                              {row.productSnapshot.model}
                            </span>
                          )}
                          {row.productSnapshot.name && (
                            <span className="text-gray-600 italic">
                              {row.productSnapshot.name}
                            </span>
                          )}
                          <span className="text-gray-600">
                            SN: {row.productSnapshot.serialNumber}
                          </span>
                          <span className="text-gray-600">
                            {row.productSnapshot.assignedTo} (
                            {row.productSnapshot.location})
                          </span>
                          {row.productSnapshot.countryCode && (
                            <QuoteLocationWithCountry
                              country={row.productSnapshot.countryCode}
                            />
                          )}
                        </>
                      ) : null}
                      {row.issues && row.issues.length > 0 && (
                        <span className="text-gray-600">
                          Issues: {row.issues.join(", ")}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-2 w-28 text-xs">
                    {row.dataWipeAsset
                      ? formatDateString(row.dataWipeAsset.desirableDate)
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
