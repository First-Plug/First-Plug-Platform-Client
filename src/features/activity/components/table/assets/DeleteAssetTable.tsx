import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/shared";
import { Product } from "@/features/assets";
import MemberNameAndLocationWithCountry from "../../member-name/MemberNameAndLocationWithCountry";

interface AssetAttribute {
  key: string;
  value: string;
}

interface Asset {
  category: string;
  name: string;
  serialNumber: string;
  location?: string;
  assignedMember?: string;
  attributes?: AssetAttribute[];
  recoverable: boolean;
}

interface AssetsTableProps {
  data: Asset | Asset[];
}

const DeleteAssetsTable: React.FC<AssetsTableProps> = ({ data }) => {
  const normalizedData: Asset[] = Array.isArray(data) ? data : [data];

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-light-grey border-gray-200 rounded-md">
          <TableHead className="px-4 py-3 border-r font-semibold text-black text-start">
            Category
          </TableHead>
          <TableHead className="px-4 py-3 border-r font-semibold text-black text-start">
            Brand + Model + Name
          </TableHead>
          <TableHead className="px-4 py-3 border-r font-semibold text-black text-start">
            Serial
          </TableHead>
          <TableHead className="px-4 py-3 border-r font-semibold text-black text-start">
            Location / Assigned Member
          </TableHead>
          <TableHead className="px-4 py-3 font-semibold text-black text-start">
            Recoverable
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {normalizedData.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="h-24 text-center">
              No assets found.
            </TableCell>
          </TableRow>
        ) : (
          normalizedData.map((asset, index) => (
            <TableRow key={index}>
              <TableCell className="px-4 py-2 border-r text-xs">
                {asset.category}
              </TableCell>
              <TableCell className="px-4 py-2 border-r text-xs">
                {[
                  asset.attributes?.find((attr) => attr.key === "brand")?.value,
                  asset.attributes?.find((attr) => attr.key === "model")?.value,
                  asset.name,
                ]
                  .filter(Boolean)
                  .join(" ")}{" "}
              </TableCell>
              <TableCell className="px-4 py-2 border-r text-xs">
                {asset.serialNumber || "N/A"}
              </TableCell>
              <TableCell className="px-4 py-2 border-r text-xs">
                <MemberNameAndLocationWithCountry product={asset as Product} />
              </TableCell>
              <TableCell className="px-4 py-2 text-xs">
                {asset.recoverable ? "Yes" : "No"}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default DeleteAssetsTable;
