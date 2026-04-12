export interface DeltaListItemDto {
  deltaId: string;
  vendorId: string;
  vendorName: string;
  deltaDate: string;
  deltaType:
    | 'new_vendor_signal'
    | 'score_change'
    | 'governance_change'
    | 'integration_change'
    | 'maturity_change'
    | 'source_added'
    | 'source_removed'
    | 'confidence_drop'
    | 'stale_to_failed'
    | 'failed_to_recovered';
  impactedDimension: 'maturity' | 'integration' | 'governance' | 'confidence' | 'source' | 'freshness';
  oldValue: string | null;
  newValue: string | null;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  sourceRunId: string;
  detectedBy: string;
  reviewStatus: 'open' | 'in_review' | 'accepted' | 'dismissed' | 'escalated';
}

export interface DeltaDetailDto {
  deltaId: string;
  deltaSummary: string;
  rationale: string;
  evidenceRefs: string[];
  oldStructuredState: Record<string, unknown>;
  newStructuredState: Record<string, unknown>;
  changeReasoning: string;
  escalationTriggered: boolean;
  escalationRef: string | null;
}

export interface DeltaListResponseDto {
  items: DeltaListItemDto[];
  page: number;
  pageSize: number;
  total: number;
}

export interface DeltaListQueryState {
  deltaType: string;
  impactedDimension: string;
  severity: string;
  reviewStatus: string;
  sortBy: 'deltaDate' | 'severity' | 'confidence';
  sortOrder: 'asc' | 'desc';
  page: number;
  pageSize: number;
}
