interface PaginationMeta {
  totalItemsCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export interface Paginated<TData extends object> {
  items: TData[];
  meta: PaginationMeta;
}

export interface PaginationDto {
  page?: number;
  limit?: number;
}
