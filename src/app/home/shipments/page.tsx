"use client";

import { ShipmentsTable } from "@/features/shipments";
import { PageLayout } from "@/shared";

export default function Shipments() {
  return (
    <PageLayout>
      <ShipmentsTable />
    </PageLayout>
  );
}
