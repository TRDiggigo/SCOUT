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

export interface ErrorListResponseDto {
  items: ErrorListItemDto[];
  page: number;
  pageSize: number;
  total: number;
}

export interface ErrorListQueryState {
  severity: string;
  stage: string;
  resolutionStatus: string;
  sortBy: 'firstSeenAt' | 'severity' | 'stage' | 'resolutionStatus';
  sortOrder: 'asc' | 'desc';
  page: number;
  pageSize: number;
}
