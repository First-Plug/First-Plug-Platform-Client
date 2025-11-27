import type { AsapOrDateValue } from "../components/ShipmentWithFp/asap-or-date";

export interface Shipment {
  _id: string;
  order_id: string;
  tenant: string;
  quantity_products: number;
  order_date: Date;
  shipment_type: string;
  shipment_status: ShipmentStatus;
  price: Price;
  origin: string;
  originDetails?: Details;
  destination: string;
  destinationDetails?: Details;
  type: "shipments";
  products: string[];
  snapshots: Snapshot[];
  isDeleted: boolean;
  deletedAt: null;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
  trackingURL?: string;
}

export interface Details {
  address: string;
  city: string;
  country: string;
  zipCode: string;
  apartment: string;
  phone: string;
  personalEmail?: string;
  dni?: string;
  assignedEmail: string;
  desirableDate?: "ASAP" | string;
  _id: string;
  state?: string;
}

export interface Price {
  amount: null | number;
  currencyCode: string;
  _id: string;
}

export enum ShipmentStatus {
  Available = "Available",
  Complete = "Complete",
  "Missing Data" = "Missing Data",
  Delivered = "Delivered",
  Preparing = "Preparing",
  Shipped = "Shipped",
  Unavailable = "Unavailable",
  "In Transit" = "In Transit",
  "In Transit - Missing Data" = "In Transit - Missing Data",
  "In Preparation" = "In Preparation",
  "On The Way" = "On The Way",
  Received = "Received",
  Cancelled = "Cancelled",
  "On Hold - Missing Data" = "On Hold - Missing Data",
}

export interface Snapshot {
  _id: string;
  name: string;
  category: string;
  attributes: Attribute[];
  status: string;
  recoverable: boolean;
  serialNumber: string;
  assignedEmail: string;
  assignedMember: string;
  lastAssigned: string;
  acquisitionDate: string;
  location: string;
  additionalInfo?: string;
  productCondition: string;
  fp_shipment: boolean;
}

export interface Attribute {
  key: string;
  value: string;
  _id: string;
}

export interface UpdateShipment {
  desirableDateOrigin: AsapOrDateValue | string;
  desirableDateDestination: AsapOrDateValue | string;
}
