export interface LogisticOrder {
  orderId: string;
  tenant: string;
  quantity: number;
  orderDate: string;
  shipmentStatus: ShipmentStatus;
  price: string;
  origin: string;
  destination: string;
  products: string;
  shipmentType: ShipmentType;
  trackingURL: string;
  destinationDetails: string;
  updatedAt: string;
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
