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

export interface RunListQueryDto {
  status?: RunSummaryDto['status'];
  mode?: RunSummaryDto['mode'];
  runDate?: string;
  sortBy?: 'runDate' | 'startedAt' | 'status' | 'failedVendors' | 'budgetUsedUsd';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface RunListResponseDto {
  items: RunSummaryDto[];
  page: number;
  pageSize: number;
  total: number;
}

const STUB_RUNS: RunSummaryDto[] = [
  { runId: 'run-2026-04-11-001', runDate: '2026-04-11', startedAt: '2026-04-11T06:00:00Z', finishedAt: '2026-04-11T06:22:00Z', status: 'success', mode: 'scheduled', vendorScope: 'all-active', totalVendors: 50, successVendors: 48, failedVendors: 1, staleVendors: 1, budgetUsedUsd: 123.45, budgetLimitUsd: 500, concurrencyLimit: 5, initiatedBy: 'scheduler', manifestRef: 'runs/2026-04-11-001/manifest.json' },
  { runId: 'run-2026-04-10-002', runDate: '2026-04-10', startedAt: '2026-04-10T09:30:00Z', finishedAt: '2026-04-10T09:55:00Z', status: 'partial_success', mode: 'manual', vendorScope: 'priority-vendors', totalVendors: 20, successVendors: 17, failedVendors: 2, staleVendors: 1, budgetUsedUsd: 88.1, budgetLimitUsd: 500, concurrencyLimit: 4, initiatedBy: 'operator-1', manifestRef: 'runs/2026-04-10-002/manifest.json' },
  { runId: 'run-2026-04-09-003', runDate: '2026-04-09', startedAt: '2026-04-09T08:00:00Z', finishedAt: null, status: 'running', mode: 'retry_failed', vendorScope: 'failed-only', totalVendors: 8, successVendors: 3, failedVendors: 2, staleVendors: 3, budgetUsedUsd: 35.2, budgetLimitUsd: 500, concurrencyLimit: 2, initiatedBy: 'operator-2', manifestRef: 'runs/2026-04-09-003/manifest.json' },
];

/**
 * WP-02.4: typed stub response until read-model/pipeline contracts are integrated.
 */
export class RunService {
  public async listRuns(query: RunListQueryDto): Promise<RunListResponseDto> {
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.max(1, query.pageSize ?? 10);

    let items = [...STUB_RUNS];

    if (query.status) items = items.filter((item) => item.status === query.status);
    if (query.mode) items = items.filter((item) => item.mode === query.mode);
    if (query.runDate) items = items.filter((item) => item.runDate === query.runDate);

    const sortBy = query.sortBy ?? 'runDate';
    const sortOrder = query.sortOrder ?? 'desc';

    items.sort((left, right) => {
      let leftValue: string | number = left.runDate;
      let rightValue: string | number = right.runDate;

      if (sortBy === 'startedAt') {
        leftValue = left.startedAt;
        rightValue = right.startedAt;
      } else if (sortBy === 'status') {
        leftValue = left.status;
        rightValue = right.status;
      } else if (sortBy === 'failedVendors') {
        leftValue = left.failedVendors;
        rightValue = right.failedVendors;
      } else if (sortBy === 'budgetUsedUsd') {
        leftValue = left.budgetUsedUsd;
        rightValue = right.budgetUsedUsd;
      }

      if (leftValue < rightValue) return sortOrder === 'asc' ? -1 : 1;
      if (leftValue > rightValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    const total = items.length;
    const start = (page - 1) * pageSize;

    return { items: items.slice(start, start + pageSize), page, pageSize, total };
  }
}
