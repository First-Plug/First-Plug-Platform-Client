import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  countriesByCode,
} from "@/shared";

import { Office } from "@/features/settings";
import { Product } from "@/features/assets";

interface OfficeWithProducts extends Office {
  products?: Product[];
}

interface OfficesTableProps {
  data: OfficeWithProducts | OfficeWithProducts[];
}

const DeleteOfficesTable: React.FC<OfficesTableProps> = ({ data }) => {
  const normalizedData: OfficeWithProducts[] = Array.isArray(data)
    ? data
    : [data];

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-light-grey border-gray-200 rounded-md">
          <TableHead className="px-4 py-3 border-r font-semibold text-black text-start">
            Name
          </TableHead>
          <TableHead className="px-4 py-3 border-r font-semibold text-black text-start">
            Country
          </TableHead>
          <TableHead className="px-4 py-3 border-r font-semibold text-black text-start">
            Non recoverable products
          </TableHead>
          <TableHead className="px-4 py-3 font-semibold text-black text-start">
            Serial Number
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {normalizedData.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="h-24 text-center">
              No offices found.
            </TableCell>
          </TableRow>
        ) : (
          normalizedData.map((office, officeIndex) => {
            const nonRecoverableProducts =
              office.products?.filter((p) => !p.recoverable) || [];

            if (nonRecoverableProducts.length === 0) {
              return (
                <TableRow key={officeIndex}>
                  <TableCell className="px-4 py-2 border-r text-xs">
                    {office.name}
                  </TableCell>
                  <TableCell className="px-4 py-2 border-r text-xs">
                    {office.country
                      ? countriesByCode[office.country] || office.country
                      : "-"}
                  </TableCell>
                  <TableCell className="px-4 py-2 border-r text-xs">
                    -
                  </TableCell>
                  <TableCell className="px-4 py-2 text-xs">-</TableCell>
                </TableRow>
              );
            }

            return nonRecoverableProducts.map((product, productIndex) => (
              <TableRow key={`${officeIndex}-${productIndex}`}>
                {productIndex === 0 && (
                  <>
                    <TableCell
                      className="px-4 py-2 border-r text-xs"
                      rowSpan={nonRecoverableProducts.length}
                    >
                      {office.name}
                    </TableCell>
                    <TableCell
                      className="px-4 py-2 border-r text-xs"
                      rowSpan={nonRecoverableProducts.length}
                    >
                      {office.country
                        ? countriesByCode[office.country] || office.country
                        : "-"}
                    </TableCell>
                  </>
                )}
                <TableCell className="px-4 py-2 border-r text-xs">
                  {[
                    product.attributes?.find((attr) => attr.key === "brand")
                      ?.value,
                    product.attributes?.find((attr) => attr.key === "model")
                      ?.value,
                    product.name,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                </TableCell>
                <TableCell className="px-4 py-2 text-xs">
                  {product.serialNumber || "-"}
                </TableCell>
              </TableRow>
            ));
          })
        )}
      </TableBody>
    </Table>
  );
};

export default DeleteOfficesTable;
