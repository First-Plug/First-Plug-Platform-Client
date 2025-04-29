"use client";

import ShipmentsTable from "@/shipments/components/Table/ShipmentsTable";

import { PageLayout } from "@/common";

export default function Shipments() {
  return (
    <PageLayout>
      <ShipmentsTable />
    </PageLayout>
  );
}
