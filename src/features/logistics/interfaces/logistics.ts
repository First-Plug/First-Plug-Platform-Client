import type { Details } from "@/features/shipments";

export interface LogisticOrder {
  _id: string;
  order_id: string;
  tenant: string;
  quantity_products: number;
  order_date: string;
  shipment_status: ShipmentStatus;
  price: {
    currencyCode: string;
    amount: number;
  };
  origin: string;
  destination: string;
  products: string[];
  shipment_type: ShipmentType;
  trackingURL?: string;
  destinationDetails: Details;
  originDetails: Details;
  snapshots: any[];
  statusColor: string;
  typeColor: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ShipmentStatus =
  | "On Hold - Missing Data"
  | "Received"
  | "Cancelled"
  | "On The Way"
  | "In Preparation";

export type ShipmentType = "Courrier" | "Internal" | "TBC";

export interface LogisticFilters {
  tenant?: string;
  shipmentStatus?: ShipmentStatus[];
  shipmentType?: ShipmentType[];
  origin?: string[];
  destination?: string[];
}
