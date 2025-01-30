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
  createdAt: Date;
  updatedAt: Date;
}

export interface Changes {
  oldData: any;
  newData: any;
}
