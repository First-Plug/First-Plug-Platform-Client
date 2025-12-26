import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/shared";
import { formatDate } from "@/shared";
import { QuoteLocationWithCountry } from "./QuoteLocationWithCountry";

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
  destination?: {
    destinationType?: string;
    warehouse?: {
      warehouseName: string;
      countryCode: string;
    };
  };
}

interface QuoteService {
  serviceCategory: string;
  issues?: string[];
  impactLevel?: string;
  issueStartDate?: string;
  productSnapshot?: {
    category?: string;
    brand?: string;
    model?: string;
    serialNumber: string;
    location: string;
    assignedTo: string;
    countryCode: string;
  };
  enrolledDevices?: EnrolledDevice[];
  assets?: DataWipeAsset[];
  additionalDetails?: string;
}

interface Quote {
  requestId: string;
  status?: string;
  products?: QuoteProduct[];
  services?: QuoteService[];
}

interface CancelQuotesTableProps {
  data: {
    oldData: Quote;
    newData: Quote;
  };
}

const CancelQuotesTable: React.FC<CancelQuotesTableProps> = ({ data }) => {
  const { oldData, newData } = data;

  // Flatten products and services from oldData
  const flattenedRows = [];

  // Add product rows
  if (oldData.products && oldData.products.length > 0) {
    oldData.products.forEach((product) => {
      flattenedRows.push({
        quoteId: oldData.requestId,
        type: "product",
        ...product,
      });
    });
  }

  // Add service rows
  if (oldData.services && oldData.services.length > 0) {
    oldData.services.forEach((service) => {
      // For Enrollment, create a row for each enrolled device
      if (
        service.serviceCategory === "Enrollment" &&
        service.enrolledDevices &&
        service.enrolledDevices.length > 0
      ) {
        service.enrolledDevices.forEach((device) => {
          flattenedRows.push({
            quoteId: oldData.requestId,
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
          flattenedRows.push({
            quoteId: oldData.requestId,
            type: "service",
            serviceCategory: service.serviceCategory,
            dataWipeAsset: asset,
            additionalDetails: service.additionalDetails,
          });
        });
      } else {
        // For other services (IT Support, etc.)
        flattenedRows.push({
          quoteId: oldData.requestId,
          type: "service",
          ...service,
        });
      }
    });
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-light-grey border-gray-200 rounded-md">
          <TableHead className="w-40 px-4 py-3 border-r font-semibold text-black text-start">
            Quote ID
          </TableHead>
          <TableHead className="w-20 px-4 py-3 border-r font-semibold text-black text-start">
            Type
          </TableHead>
          <TableHead className="w-28 px-4 py-3 border-r font-semibold text-black text-start">
            Category
          </TableHead>
          <TableHead className="w-64 px-4 py-3 border-r font-semibold text-black text-start">
            Details
          </TableHead>
          <TableHead className="w-28 px-4 py-3 font-semibold text-black text-start">
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
              <TableCell className="w-40 px-4 py-2 border-r text-xs">
                {row.quoteId}
              </TableCell>
              <TableCell className="w-20 px-4 py-2 border-r text-xs capitalize">
                {row.type}
              </TableCell>

              {row.type === "product" ? (
                <>
                  <TableCell className="w-28 px-4 py-2 border-r text-xs">
                    {row.category}
                  </TableCell>
                  <TableCell className="w-64 px-4 py-2 border-r text-xs">
                    <div className="flex flex-col gap-1">
                      <span>Qty: {row.quantity}</span>
                      <QuoteLocationWithCountry country={row.country} />
                    </div>
                  </TableCell>
                  <TableCell className="w-28 px-4 py-2 text-xs">
                    {row.deliveryDate ? formatDate(row.deliveryDate) : "N/A"}
                  </TableCell>
                </>
              ) : (
                <>
                  <TableCell className="w-28 px-4 py-2 border-r text-xs">
                    {row.serviceCategory}
                  </TableCell>
                  <TableCell className="w-64 px-4 py-2 border-r text-xs">
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
                          <span className="text-gray-600">
                            Current:{" "}
                            {row.dataWipeAsset.productSnapshot.location}
                          </span>
                          {row.dataWipeAsset.productSnapshot.countryCode && (
                            <QuoteLocationWithCountry
                              country={
                                row.dataWipeAsset.productSnapshot.countryCode
                              }
                            />
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
                  <TableCell className="w-28 px-4 py-2 text-xs">
                    {row.dataWipeAsset
                      ? row.dataWipeAsset.desirableDate
                        ? formatDate(row.dataWipeAsset.desirableDate)
                        : "N/A"
                      : row.issueStartDate
                      ? formatDate(row.issueStartDate)
                      : "N/A"}
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

export default CancelQuotesTable;
