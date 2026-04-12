export interface RunSummaryDto {
  runId: string;
  runDate: string;
  startedAt: string;
  finishedAt: string | null;
  status: 'planned' | 'running' | 'success' | 'partial_success' | 'failed';
  mode: 'scheduled' | 'manual' | 'dry_run' | 'retry_failed' | 'digest';
  vendorScope: string;
  totalVendors: number;
  successVendors: number;
  failedVendors: number;
  staleVendors: number;
  budgetUsedUsd: number;
  budgetLimitUsd: number;
  concurrencyLimit: number;
  initiatedBy: string;
  manifestRef: string;
}

export interface RunListResponseDto {
  items: RunSummaryDto[];
  page: number;
  pageSize: number;
  total: number;
}

export interface RunListQueryState {
  status: string;
  mode: string;
  runDate: string;
  sortBy: 'runDate' | 'startedAt' | 'status' | 'failedVendors' | 'budgetUsedUsd';
  sortOrder: 'asc' | 'desc';
  page: number;
  pageSize: number;
}
