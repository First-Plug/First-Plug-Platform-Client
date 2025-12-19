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
  extendedWarranty?: {
    enabled: boolean;
    extraYears?: number;
  };
  deviceEnrollment?: boolean;
  otherSpecifications?: string;
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
    otherSpecifications?: string;
    extendedWarranty?: boolean;
    extendedWarrantyYears?: number;
    deviceEnrollment?: boolean;
    city?: string;
    deliveryDate?: string;
    comments?: string;
  }>;
}

export interface QuoteStore {
  products: QuoteProduct[];
  isAddingProduct: boolean;
  currentStep: number;
  editingProductId?: string;
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
  // Controlar estado del formulario
  setIsAddingProduct: (isAdding: boolean) => void;
  setCurrentStep: (step: number) => void;
  setOnBack: (callback: (() => void) | undefined) => void;
  setOnCancel: (callback: (() => void) | undefined) => void;
  setEditingProductId: (id: string | undefined) => void;
}
