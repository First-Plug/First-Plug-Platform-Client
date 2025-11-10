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
}

interface AssetsTableProps {
  data: {
    oldData: Asset[];
    newData: Asset[];
  };
}

const ActionAssetTable: React.FC<AssetsTableProps> = ({ data }) => {
  const oldData: Asset[] = Array.isArray(data.oldData)
    ? data.oldData
    : [data.oldData];

  const newData: Asset[] = Array.isArray(data.newData)
    ? data.newData
    : [data.newData];

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
            Old Location
          </TableHead>
          <TableHead className="px-4 py-3 font-semibold text-black text-start">
            New Location
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {oldData.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="h-24 text-center">
              No assets found.
            </TableCell>
          </TableRow>
        ) : (
          oldData.map((asset, index) => (
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
                <MemberNameAndLocationWithCountry
                  product={newData[index] as Product}
                />
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default ActionAssetTable;
