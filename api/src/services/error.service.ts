export interface ErrorListItemDto {
  errorId: string;
  runId: string;
  vendorId: string | null;
  stage: 'A1' | 'A2' | 'A3' | 'A4' | 'A5' | 'A6' | 'config' | 'system';
  errorType:
    | 'research_error'
    | 'extraction_error'
    | 'schema_validation_error'
    | 'scoring_error'
    | 'persistence_error'
    | 'config_error'
    | 'budget_limit_exceeded'
    | 'provider_error'
    | 'timeout'
    | 'unknown';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  firstSeenAt: string;
  retryStatus: 'not_retried' | 'queued' | 'retried' | 'resolved';
  resolutionStatus: 'open' | 'investigating' | 'fixed' | 'dismissed';
  assignedTo: string | null;
}

export interface ErrorListQueryDto {
  severity?: ErrorListItemDto['severity'];
  stage?: ErrorListItemDto['stage'];
  resolutionStatus?: ErrorListItemDto['resolutionStatus'];
  sortBy?: 'firstSeenAt' | 'severity' | 'stage' | 'resolutionStatus';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface ErrorListResponseDto {
  items: ErrorListItemDto[];
  page: number;
  pageSize: number;
  total: number;
}

const STUB_ERRORS: ErrorListItemDto[] = [
  {
    errorId: 'err-001', runId: 'run-2026-04-11-001', vendorId: 'vendor-003', stage: 'A2', errorType: 'extraction_error', severity: 'high',
    message: 'Extraction schema mismatch for governance block.', firstSeenAt: '2026-04-11T06:05:00Z', retryStatus: 'queued', resolutionStatus: 'open', assignedTo: 'operator-1',
  },
  {
    errorId: 'err-002', runId: 'run-2026-04-10-002', vendorId: null, stage: 'config', errorType: 'config_error', severity: 'medium',
    message: 'Provider configuration key missing fallback.', firstSeenAt: '2026-04-10T09:32:00Z', retryStatus: 'not_retried', resolutionStatus: 'investigating', assignedTo: 'admin-1',
  },
  {
    errorId: 'err-003', runId: 'run-2026-04-09-003', vendorId: 'vendor-002', stage: 'A1', errorType: 'timeout', severity: 'critical',
    message: 'Research stage timed out for vendor public docs.', firstSeenAt: '2026-04-09T08:10:00Z', retryStatus: 'retried', resolutionStatus: 'fixed', assignedTo: null,
  },
];

/**
 * WP-02.5: typed stub response until read-model/pipeline contracts are integrated.
 */
export class ErrorService {
  public async listErrors(query: ErrorListQueryDto): Promise<ErrorListResponseDto> {
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.max(1, query.pageSize ?? 10);

    let items = [...STUB_ERRORS];

    if (query.severity) items = items.filter((item) => item.severity === query.severity);
    if (query.stage) items = items.filter((item) => item.stage === query.stage);
    if (query.resolutionStatus) items = items.filter((item) => item.resolutionStatus === query.resolutionStatus);

    const sortBy = query.sortBy ?? 'firstSeenAt';
    const sortOrder = query.sortOrder ?? 'desc';

    items.sort((left, right) => {
      let leftValue: string | number = left.firstSeenAt;
      let rightValue: string | number = right.firstSeenAt;

      if (sortBy === 'severity') {
        leftValue = left.severity;
        rightValue = right.severity;
      } else if (sortBy === 'stage') {
        leftValue = left.stage;
        rightValue = right.stage;
      } else if (sortBy === 'resolutionStatus') {
        leftValue = left.resolutionStatus;
        rightValue = right.resolutionStatus;
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
