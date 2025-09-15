"use client";

import {
  AddIcon,
  Button,
  PageLayout,
  PaginationAdvanced,
  useAsideStore,
  PenIcon,
  TrashIcon,
} from "@/shared";

import { DataTable } from "@/features/fp-tables";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { createFilterStore } from "@/features/fp-tables/store/createFilterStore";

const useWarehousesFilterStore = createFilterStore();

export default function WarehousesPage() {
  const { setAside } = useAsideStore();

  const warehousesData = [
    {
      id: "1",
      name: "Asia Pacific Center",
      country: "Singapore",
      partnerType: "temporary",
      isActive: false,
      tenantCount: 4,
      totalProducts: 2100,
    },
    {
      id: "2",
      name: "Central Distribution Center",
      country: "United States",
      partnerType: "own",
      isActive: true,
      tenantCount: 3,
      totalProducts: 1250,
    },
    {
      id: "3",
      name: "European Logistics Hub",
      country: "Germany",
      partnerType: "partner",
      isActive: true,
      tenantCount: 2,
      totalProducts: 850,
    },
  ];

  const columns = [
    {
      accessorKey: "name",
      header: "Warehouse Name",
      cell: ({ row }: any) => (
        <div className="flex items-center">
          <span className="font-medium">{row.getValue("name")}</span>
        </div>
      ),
    },
    {
      accessorKey: "country",
      header: "Country",
    },
    {
      accessorKey: "partnerType",
      header: "Partner Type",
      cell: ({ row }: any) => {
        const type = row.getValue("partnerType");
        const getBadgeColor = (type: string) => {
          switch (type) {
            case "temporary":
              return "bg-[#FFE9AF] text-[#8B6B00]";
            case "own":
              return "bg-[#D8E7FF] text-[#18489A]";
            case "partner":
              return "bg-[#AAF6CD] text-[#2E7B32]";
            default:
              return "bg-[#F7F7F9] text-[#5D6470]";
          }
        };
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor(
              type
            )}`}
          >
            {type}
          </span>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: "Is Active",
      cell: ({ row }: any) => {
        const isActive = row.getValue("isActive");
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              isActive
                ? "bg-[#AAF6CD] text-[#2E7B32]"
                : "bg-[#FFC6D3] text-[#B73232]"
            }`}
          >
            {isActive ? "Yes" : "No"}
          </span>
        );
      },
    },
    {
      accessorKey: "tenantCount",
      header: "Number of Tenants",
    },
    {
      accessorKey: "totalProducts",
      header: "Total Products",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => (
        <div className="flex gap-1">
          <Button
            className="m-0 p-0 min-w-0"
            variant="outline"
            size="small"
            icon={<PenIcon className="w-4 h-4 text-blue" strokeWidth={2} />}
          />

          <Button
            className="m-0 p-0 min-w-0"
            variant="outline"
            size="small"
            icon={
              <TrashIcon className="w-4 h-4 text-[#B73232]" strokeWidth={2} />
            }
          />

          <Button
            className="m-0 p-0 min-w-0"
            icon={
              false ? (
                <ChevronUpIcon size={16} />
              ) : (
                <ChevronDownIcon size={16} />
              )
            }
            body="Details"
            variant="outline"
            size="small"
            onClick={() => {}}
          />
        </div>
      ),
    },
  ];

  return (
    <PageLayout>
      <div className="flex flex-col h-full max-h-full">
        <div className="flex justify-between items-center mb-4">
          <Button
            size="small"
            variant="secondary"
            body="Clear All Filters"
            onClick={() => {}}
          />

          <Button
            size="small"
            variant="primary"
            body="Create Warehouse"
            icon={<AddIcon />}
            onClick={() => setAside("CreateTenant")}
          />
        </div>

        {/* Tabla */}
        <div className="flex-1 min-h-0">
          <DataTable
            columns={columns}
            data={warehousesData}
            useFilterStore={useWarehousesFilterStore}
            rowHeight={56}
            adaptiveHeight={false}
            enableSnapScroll={false}
          />
        </div>

        {/* Paginación */}
        <div className="mt-2 pt-6">
          <PaginationAdvanced
            pageIndex={0}
            pageCount={1}
            setPageIndex={() => {}}
            pageSize={10}
            setPageSize={() => {}}
          />
        </div>
      </div>
    </PageLayout>
  );
}
