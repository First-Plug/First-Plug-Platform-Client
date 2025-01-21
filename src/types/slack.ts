export interface SlackNotificationPayloadBulk {
  products: {
    category: string;
    brand?: string;
    model?: string;
    name?: string;
    quantity?: number;
  }[];
  to: {
    name: string;
    address: string;
    apartment?: string;
    zipCode: string;
    phone?: string;
    email?: string;
    personalEmail?: string;
    dni?: string;
    city?: string;
    state?: string;
    country?: string;
    quantity: number;
    serialNumbers: string;
  }[];
  action: string;
  tenantName: string;
}

export interface SlackNotificationPayload {
  from: {
    name: string;
    address: string;
    apartment?: string;
    zipCode: string;
    phone?: string;
    email?: string;
    personalEmail?: string;
    dni?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  to: {
    name: string;
    address: string;
    apartment?: string;
    zipCode: string;
    phone?: string;
    email?: string;
    personalEmail?: string;
    dni?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  products: {
    category: string;
    brand?: string;
    model?: string;
    name?: string;
    serialNumber?: string;
  }[];
  action: string;
  tenantName: string;
}
