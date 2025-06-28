export interface UseAsyncState<T = unknown> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  setData: (data: T | null) => void;
}

export interface UseApiResponse<T = unknown> extends UseAsyncState<T> {
  mutate: (data: Partial<T>) => Promise<void>;
  remove: () => Promise<void>;
}

export interface UsePaginationReturn {
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrevious: boolean;
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  setPageSize: (size: number) => void;
}
