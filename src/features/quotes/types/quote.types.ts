export interface QuoteProduct {
  id: string; // UUID temporal generado al iniciar el formulario
  category: string;
  operatingSystem?: string;
  quantity: number;
  brands: string[]; // Múltiples valores seleccionados
  models: string[]; // Múltiples valores seleccionados
  processors?: string[]; // Múltiples procesadores seleccionados
  ram?: string[];
  storage?: string[];
  screenSize?: string[];
  screenTechnology?: string[];
  extendedWarranty?: {
    enabled: boolean;
    extraYears?: number;
  };
  deviceEnrollment?: boolean;
  otherSpecifications?: string;
  description?: string; // Para Merchandising
  additionalRequirements?: string; // Para Merchandising
  furnitureType?: string[]; // Para Furniture
  country: string;
  city?: string;
  requiredDeliveryDate?: string; // Formato ISO string
  additionalComments?: string;
}

export interface BuybackDetail {
  assetId: string;
  generalFunctionality?: string;
  batteryCycles?: string;
  aestheticDetails?: string;
  hasCharger?: boolean;
  chargerWorks?: boolean;
  additionalComments?: string;
}

export interface QuoteService {
  id: string; // UUID temporal generado al iniciar el formulario
  serviceType: string; // Tipo de servicio (ej: "it-support", "enrollment", "buyback", "data-wipe")
  assetId?: string; // ID del asset seleccionado (para IT Support - single)
  assetIds?: string[]; // IDs de los assets seleccionados (para Enrollment - multiple, Buyback - multiple, Data Wipe - multiple)
  issueTypes?: string[]; // Tipos de issues seleccionados (para IT Support)
  description?: string; // Descripción del issue (para IT Support)
  issueStartDate?: string; // Fecha de inicio del issue (para IT Support, formato ISO string)
  impactLevel?: string; // Nivel de impacto: "low", "medium", "high" (para IT Support)
  additionalDetails?: string; // Detalles adicionales (para Enrollment, Data Wipe)
  buybackDetails?: Record<string, BuybackDetail>; // Detalles de Buyback por assetId (para Buyback)
  additionalInfo?: string; // Información adicional para Buyback
  dataWipeDetails?: Record<string, DataWipeDetail>; // Detalles de Data Wipe por assetId (para Data Wipe)
  cleaningType?: "Superficial" | "Deep"; // Tipo de limpieza (opcional, por defecto Deep)
  country: string;
  city?: string;
  requiredDeliveryDate?: string; // Formato ISO string
  additionalComments?: string;
}

export interface QuoteRequestPayload {
  products: Array<{
    category: string;
    quantity: number;
    country: string;
    os?: string;
    brand?: string[];
    model?: string[];
    processor?: string[];
    ram?: string[];
    storage?: string[];
    screenSize?: string[];
    screenTechnology?: string[];
    otherSpecifications?: string;
    description?: string; // Para Merchandising
    additionalRequirements?: string; // Para Merchandising
    furnitureType?: string[]; // Para Furniture
    extendedWarranty?: boolean;
    extendedWarrantyYears?: number;
    deviceEnrollment?: boolean;
    city?: string;
    deliveryDate?: string;
    comments?: string;
  }>;
  services?: Array<{
    serviceCategory: string;
    productId?: string;
    productIds?: string[];
    productSnapshot?: {
      category: string;
      name: string;
      brand: string;
      model: string;
      serialNumber: string;
      location: string;
      assignedTo: string;
      countryCode: string;
    };
    enrolledDevices?: Array<{
      category: string;
      name: string;
      brand: string;
      model: string;
      serialNumber: string;
      location: string;
      assignedTo: string;
      countryCode: string;
    }>;
    products?: Array<{
      productId: string;
      productSnapshot: {
        category: string;
        name: string;
        brand: string;
        model: string;
        serialNumber: string;
        location: string;
        assignedTo: string;
        countryCode: string;
        os?: string;
        processor?: string;
        ram?: string;
        storage?: string;
        screenSize?: string;
        productCondition?: string;
        additionalInfo?: string;
      };
      buybackDetails?: {
        generalFunctionality?: string;
        batteryCycles?: string;
        aestheticDetails?: string;
        hasCharger?: boolean;
        chargerWorks?: boolean;
        additionalComments?: string;
      };
    }>;
    issues?: string[];
    description?: string;
    issueStartDate?: string;
    impactLevel?: string;
    additionalDetails?: string;
    additionalInfo?: string;
  }>;
}

export interface QuoteStore {
  products: QuoteProduct[];
  services: QuoteService[];
  isAddingProduct: boolean;
  isAddingService: boolean;
  currentStep: number;
  currentCategory?: string; // Categoría seleccionada en el flujo actual
  currentServiceType?: string; // Tipo de servicio seleccionado en el flujo actual
  editingProductId?: string;
  editingServiceId?: string;
  onBack?: (() => void) | undefined;
  onCancel?: (() => void) | undefined;
  // Guardar producto completo (al finalizar todos los steps)
  addProduct: (product: QuoteProduct) => void;
  // Actualizar producto existente (para edición futura)
  updateProduct: (id: string, updates: Partial<QuoteProduct>) => void;
  // Eliminar producto
  removeProduct: (id: string) => void;
  // Limpiar todos los productos
  clearProducts: () => void;
  // Obtener producto por ID (para edición)
  getProduct: (id: string) => QuoteProduct | undefined;
  // Guardar servicio completo (al finalizar todos los steps)
  addService: (service: QuoteService) => void;
  // Actualizar servicio existente (para edición futura)
  updateService: (id: string, updates: Partial<QuoteService>) => void;
  // Eliminar servicio
  removeService: (id: string) => void;
  // Limpiar todos los servicios
  clearServices: () => void;
  // Obtener servicio por ID (para edición)
  getService: (id: string) => QuoteService | undefined;
  // Controlar estado del formulario
  setIsAddingProduct: (isAdding: boolean) => void;
  setIsAddingService: (isAdding: boolean) => void;
  setCurrentStep: (step: number) => void;
  setCurrentCategory: (category: string | undefined) => void;
  setCurrentServiceType: (serviceType: string | undefined) => void;
  setOnBack: (callback: (() => void) | undefined) => void;
  setOnCancel: (callback: (() => void) | undefined) => void;
  setEditingProductId: (id: string | undefined) => void;
  setEditingServiceId: (id: string | undefined) => void;
}

export interface QuoteHistoryProduct {
  quantity: number;
  country: string;
  city?: string;
  deliveryDate?: string;
  comments?: string;
  otherSpecifications?: string;
  category: string;
  os?: string;
  brand?: string[];
  model?: string[];
  processor?: string[];
  ram?: string[];
  storage?: string[];
  screenSize?: string[];
  screenTechnology?: string[];
  extendedWarranty?: boolean;
  extendedWarrantyYears?: number;
  deviceEnrollment?: boolean;
}

export interface EnrolledDeviceSnapshot {
  category?: string;
  name?: string;
  brand?: string;
  model?: string;
  serialNumber: string;
  location: string;
  assignedTo: string;
  countryCode: string;
  additionalDetails?: string;
}

export interface ITSupportProductSnapshot {
  category?: string;
  name?: string;
  brand?: string;
  model?: string;
  serialNumber: string;
  location: string;
  assignedTo: string;
  countryCode: string;
}

export interface BuybackProductSnapshot {
  category: string;
  name: string;
  brand: string;
  model: string;
  serialNumber: string;
  location: string;
  assignedTo: string;
  countryCode: string;
  os?: string;
  processor?: string;
  ram?: string;
  storage?: string;
  screenSize?: string;
  productCondition?: string;
  additionalInfo?: string;
}

export interface BuybackDetails {
  generalFunctionality?: string;
  batteryCycles?: string;
  aestheticDetails?: string;
  hasCharger?: boolean;
  chargerWorks?: boolean;
  additionalComments?: string;
}

export interface DataWipeDestination {
  destinationType?: "Member" | "Office" | "FP warehouse";
  member?: {
    memberId: string;
    assignedMember: string;
    assignedEmail: string;
    countryCode: string;
  };
  office?: {
    officeId: string;
    officeName: string;
    countryCode?: string;
  };
  warehouse?: {
    warehouseId?: string;
    warehouseName?: string;
    countryCode: string;
  };
}

export interface DataWipeDetail {
  assetId: string;
  desirableDate?: string; // ISO date string (YYYY-MM-DD)
  destination?: DataWipeDestination;
}

export interface QuoteHistoryService {
  serviceCategory: string;
  country?: string;
  city?: string;
  deliveryDate?: string;
  comments?: string;
  enrolledDevices?: EnrolledDeviceSnapshot[];
  productSnapshot?: ITSupportProductSnapshot;
  products?:
    | Array<{
        productId: string;
        productSnapshot: BuybackProductSnapshot;
        buybackDetails?: BuybackDetails;
      }>
    | Array<{
        productId: string;
        productSnapshot: {
          category: string;
          name?: string;
          brand: string;
          model: string;
          serialNumber?: string;
          location: string;
          assignedTo: string;
          assignedEmail?: string;
          countryCode: string;
        };
        desiredDate?: string;
        cleaningType?: string;
        additionalComments?: string;
      }>;
  assets?: Array<{
    productId: string;
    productSnapshot: {
      category: string;
      name: string;
      brand: string;
      model: string;
      serialNumber: string;
      location: string;
      assignedTo: string;
      countryCode: string;
    };
    desirableDate?: string;
    currentLocation?: string;
    currentMember?: {
      memberId: string;
      assignedMember: string;
      assignedEmail: string;
      countryCode: string;
    };
    destination?: DataWipeDestination;
  }>;
  issues?: string[];
  description?: string;
  impactLevel?: string;
  issueStartDate?: string;
  additionalDetails?: string;
  additionalInfo?: string;
}

export interface QuoteTableWithDetailsDto {
  _id: string;
  requestId: string;
  requestType: string;
  productCount: number; // cantidad de items agregados
  totalQuantity: number; // cantidad total de productos
  createdAt: string; // fecha de creación
  userName: string; // quién lo solicitó
  status: "Requested" | "Cancelled";
  isActive: boolean;
  tenantId: string;
  tenantName: string;
  userEmail: string;
  products?: QuoteHistoryProduct[];
  services?: QuoteHistoryService[];
  updatedAt: string;
}

export interface QuoteHistoryResponse {
  data: QuoteTableWithDetailsDto[];
  totalCount: number;
  totalPages: number;
}
