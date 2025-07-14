export type TableFilters<T> = Partial<Record<keyof T, string[]>>;

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
}
