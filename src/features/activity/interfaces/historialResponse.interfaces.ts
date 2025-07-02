import { Product } from "@/features/assets";

export interface HistorialResponse {
  data: Datum[];
  totalCount: number;
  totalPages: number;
}

export interface Datum {
  _id: string;
  actionType: string;
  userId: string;
  itemType: string;
  changes: Changes;
  context: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Changes {
  oldData: any;
  newData: any;
  context?: string;
}

export interface ActivityProduct extends Omit<Product, "category"> {
  category: string;
}
