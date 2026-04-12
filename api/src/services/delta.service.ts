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

export interface DeltaListQueryDto {
  deltaType?: DeltaListItemDto['deltaType'];
  impactedDimension?: DeltaListItemDto['impactedDimension'];
  severity?: DeltaListItemDto['severity'];
  reviewStatus?: DeltaListItemDto['reviewStatus'];
  sortBy?: 'deltaDate' | 'severity' | 'confidence';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface DeltaListResponseDto {
  items: DeltaListItemDto[];
  page: number;
  pageSize: number;
  total: number;
}

const STUB_DELTAS: DeltaListItemDto[] = [
  {
    deltaId: 'delta-001', vendorId: 'vendor-001', vendorName: 'Alpha AI', deltaDate: '2026-04-11', deltaType: 'score_change', impactedDimension: 'governance',
    oldValue: '76', newValue: '80', severity: 'medium', confidence: 84, sourceRunId: 'run-2026-04-11-001', detectedBy: 'delta-detector-v1', reviewStatus: 'open',
  },
  {
    deltaId: 'delta-002', vendorId: 'vendor-002', vendorName: 'Beta Stack', deltaDate: '2026-04-10', deltaType: 'confidence_drop', impactedDimension: 'confidence',
    oldValue: '82', newValue: '76', severity: 'high', confidence: 79, sourceRunId: 'run-2026-04-10-002', detectedBy: 'delta-detector-v1', reviewStatus: 'in_review',
  },
  {
    deltaId: 'delta-003', vendorId: 'vendor-003', vendorName: 'Gamma Ops', deltaDate: '2026-04-09', deltaType: 'stale_to_failed', impactedDimension: 'freshness',
    oldValue: 'stale', newValue: 'failed', severity: 'critical', confidence: 91, sourceRunId: 'run-2026-04-09-003', detectedBy: 'delta-detector-v1', reviewStatus: 'escalated',
  },
];

const STUB_DELTA_DETAILS: Record<string, DeltaDetailDto> = {
  'delta-001': {
    deltaId: 'delta-001',
    deltaSummary: 'Governance score increased for Alpha AI.',
    rationale: 'New public audit documentation was detected.',
    evidenceRefs: ['evidence-1001', 'evidence-1002'],
    oldStructuredState: { governanceScore: 76 },
    newStructuredState: { governanceScore: 80 },
    changeReasoning: 'Evidence indicates additional compliance attestations.',
    escalationTriggered: false,
    escalationRef: null,
  },
};

/**
 * WP-03.1: typed stub response until read-model/pipeline contracts are integrated.
 */
export class DeltaService {
  public async listDeltas(query: DeltaListQueryDto): Promise<DeltaListResponseDto> {
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.max(1, query.pageSize ?? 10);

    let items = [...STUB_DELTAS];

    if (query.deltaType) items = items.filter((item) => item.deltaType === query.deltaType);
    if (query.impactedDimension) items = items.filter((item) => item.impactedDimension === query.impactedDimension);
    if (query.severity) items = items.filter((item) => item.severity === query.severity);
    if (query.reviewStatus) items = items.filter((item) => item.reviewStatus === query.reviewStatus);

    const sortBy = query.sortBy ?? 'deltaDate';
    const sortOrder = query.sortOrder ?? 'desc';

    items.sort((left, right) => {
      let leftValue: string | number = left.deltaDate;
      let rightValue: string | number = right.deltaDate;

      if (sortBy === 'severity') {
        leftValue = left.severity;
        rightValue = right.severity;
      } else if (sortBy === 'confidence') {
        leftValue = left.confidence;
        rightValue = right.confidence;
      }

      if (leftValue < rightValue) return sortOrder === 'asc' ? -1 : 1;
      if (leftValue > rightValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    const total = items.length;
    const start = (page - 1) * pageSize;

    return { items: items.slice(start, start + pageSize), page, pageSize, total };
  }

  public async getDeltaById(deltaId: string): Promise<DeltaDetailDto | null> {
    return STUB_DELTA_DETAILS[deltaId] ?? null;
  }
}
