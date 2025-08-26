export interface ShipmentsResponse {
  totalShipments: number;
  tenantsProcessed: number;
  shipments: Shipment[];
  tenantBreakdown: TenantBreakdown[];
}

export interface Shipment {
  $__: Empty;
  $isNew: boolean;
  _doc: Doc;
  tenantName: Tenant;
}

export interface Empty {
  activePaths: ActivePaths;
  skipId: boolean;
}

export interface ActivePaths {
  paths: Paths;
  states: States;
}

export interface Paths {
  isDeleted: V;
  type: V;
  destination: V;
  origin: V;
  shipment_status: V;
  shipment_type: V;
  order_date: V;
  quantity_products: V;
  tenant: V;
  order_id: V;
  products: V;
  deletedAt: V;
  _id: V;
  price: V;
  originDetails?: V;
  destinationDetails?: V;
  snapshots: V;
  createdAt: V;
  updatedAt: V;
  __v: V;
  trackingURL?: V;
}

export enum V {
  Init = "init",
}

export interface States {
  require: Default;
  default: Default;
  init: { [key: string]: boolean };
}

export interface Default {}

export interface Doc {
  _id: string;
  order_id: string;
  tenant: Tenant;
  quantity_products: number;
  order_date: Date;
  shipment_type: ShipmentType;
  shipment_status: ShipmentStatus;
  price: DocPrice;
  origin: string;
  originDetails?: { [key: string]: null | string };
  destination: string;
  destinationDetails?: { [key: string]: null | string };
  type: Type;
  products: string[];
  isDeleted: boolean;
  deletedAt: null;
  snapshots: Snapshot[];
  createdAt: Date;
  updatedAt: Date;
  __v: number;
  trackingURL?: string;
}

export interface DocPrice {
  amount: number | null;
  currencyCode: CurrencyCode;
  _id: string;
}

export enum CurrencyCode {
  Ars = "ARS",
  Bob = "BOB",
  Brl = "BRL",
  CRC = "CRC",
  Cop = "COP",
  Tbc = "TBC",
  Usd = "USD",
}

export enum ShipmentStatus {
  Cancelled = "Cancelled",
  InPreparation = "In Preparation",
  OnHoldMissingData = "On Hold - Missing Data",
  OnTheWay = "On The Way",
  Received = "Received",
}

export enum ShipmentType {
  Courrier = "Courrier",
  Internal = "Internal",
  Tbc = "TBC",
}

export interface Snapshot {
  _id: string;
  name: Name;
  category: Category;
  attributes: Attribute[];
  status: Status;
  recoverable: boolean;
  serialNumber: string;
  acquisitionDate: string;
  location: Location;
  additionalInfo?: AdditionalInfo;
  productCondition?: ProductCondition;
  fp_shipment?: boolean;
  assignedEmail?: string;
  assignedMember?: string;
  lastAssigned?: string;
  price?: SnapshotPrice;
}

export enum AdditionalInfo {
  Empty = "",
  Pruebooo = "pruebooo",
  SigoPro = "sigo pro",
  VoyProbando = "voy probando",
}

export interface Attribute {
  key: Key;
  value: string;
  _id: string;
}

export enum Key {
  Brand = "brand",
  Color = "color",
  GPU = "gpu",
  KeyboardLanguage = "keyboardLanguage",
  Model = "model",
  Processor = "processor",
  RAM = "ram",
  Screen = "screen",
  Storage = "storage",
}

export enum Category {
  Audio = "Audio",
  Computer = "Computer",
  Merchandising = "Merchandising",
  Monitor = "Monitor",
  Other = "Other",
  Peripherals = "Peripherals",
}

export enum Location {
  Employee = "Employee",
  FPWarehouse = "FP warehouse",
  OurOffice = "Our office",
}

export enum Name {
  Backpack = "Backpack",
  Campeon = "Campeon",
  Empty = "",
  Hijopu = "Hijopu",
  Mochi2 = "Mochi2",
  Mochis = "Mochis",
  Noqui = "Noqui",
  OtherX3 = "Other x3",
  Otherrrrr = "Otherrrrr",
  OtraPC = "Otra Pc",
  Otro = "Otro",
  OtroPeri = "otro peri",
  Tazas = "Tazas",
  The3Estrellas = "3 Estrellas",
  Yopo = "Yopo",
}

export interface SnapshotPrice {
  amount: number | null;
  currencyCode: CurrencyCode;
}

export enum ProductCondition {
  Defective = "Defective",
  Optimal = "Optimal",
  Unusable = "Unusable",
}

export enum Status {
  Deprecated = "Deprecated",
  InTransit = "In Transit",
  InTransitMissingData = "In Transit - Missing Data",
}

export enum Tenant {
  Adorni = "Adorni",
  Asado = "asado",
  MechiTest = "mechi_test",
  NahuelTest = "nahuel_test",
  Retool = "retool",
  Ship = "ship",
  Singoogle = "singoogle",
  Tecnico = "tecnico",
  Test = "test",
}

export enum Type {
  Shipments = "shipments",
}

export interface TenantBreakdown {
  tenantName: string;
  shipmentCount: number;
}
