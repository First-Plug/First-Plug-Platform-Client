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

export interface QuoteService {
  id: string; // UUID temporal generado al iniciar el formulario
  serviceType: string; // Tipo de servicio (ej: "it-support")
  assetId?: string; // ID del asset seleccionado (para IT Support)
  issueTypes?: string[]; // Tipos de issues seleccionados (para IT Support)
  description?: string; // Descripción del issue (para IT Support)
  issueStartDate?: string; // Fecha de inicio del issue (para IT Support, formato ISO string)
  impactLevel?: string; // Nivel de impacto: "low", "medium", "high" (para IT Support)
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
    issues?: string[];
    description?: string;
    issueStartDate?: string;
    impactLevel?: string;
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

export interface QuoteHistoryService {
  serviceCategory: string;
  country: string;
  city?: string;
  deliveryDate?: string;
  comments?: string;
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
