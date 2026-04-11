export interface VendorListItemDto {
  vendorId: string;
  vendorName: string;
  country: string;
  regionScope: string;
  category: 'platform' | 'framework' | 'orchestration' | 'vertical_solution' | 'other';
  trackingStatus: 'active' | 'inactive' | 'review_queue' | 'blocked';
  marketMaturityScore: number;
  integrationScore: number;
  governanceScore: number;
  overallScore: number;
  confidence: number;
  freshnessStatus: 'fresh' | 'stale' | 'failed' | 'unknown';
  asOfDate: string;
  sourceRunId: string;
  deltaStatus: 'no_change' | 'changed' | 'new' | 'downgraded' | 'upgraded';
  openEscalation: boolean;
}

export interface VendorListQueryDto {
  category?: VendorListItemDto['category'];
  trackingStatus?: VendorListItemDto['trackingStatus'];
  freshnessStatus?: VendorListItemDto['freshnessStatus'];
  openEscalation?: boolean;
  sortBy?: 'vendorName' | 'overallScore' | 'confidence' | 'freshnessStatus' | 'asOfDate';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface VendorListResponseDto {
  items: VendorListItemDto[];
  page: number;
  pageSize: number;
  total: number;
}

const STUB_VENDORS: VendorListItemDto[] = [
  {
    vendorId: 'vendor-001', vendorName: 'Alpha AI', country: 'DE', regionScope: 'EU', category: 'platform', trackingStatus: 'active',
    marketMaturityScore: 82, integrationScore: 77, governanceScore: 80, overallScore: 80, confidence: 88,
    freshnessStatus: 'fresh', asOfDate: '2026-04-11', sourceRunId: 'run-2026-04-11-001', deltaStatus: 'changed', openEscalation: false,
  },
  {
    vendorId: 'vendor-002', vendorName: 'Beta Stack', country: 'US', regionScope: 'Global-EU', category: 'framework', trackingStatus: 'active',
    marketMaturityScore: 70, integrationScore: 72, governanceScore: 68, overallScore: 70, confidence: 76,
    freshnessStatus: 'stale', asOfDate: '2026-04-09', sourceRunId: 'run-2026-04-11-001', deltaStatus: 'no_change', openEscalation: true,
  },
  {
    vendorId: 'vendor-003', vendorName: 'Gamma Ops', country: 'FR', regionScope: 'EU', category: 'orchestration', trackingStatus: 'review_queue',
    marketMaturityScore: 64, integrationScore: 81, governanceScore: 74, overallScore: 73, confidence: 71,
    freshnessStatus: 'failed', asOfDate: '2026-04-08', sourceRunId: 'run-2026-04-11-001', deltaStatus: 'downgraded', openEscalation: true,
  },
  {
    vendorId: 'vendor-004', vendorName: 'Delta Vertical', country: 'NL', regionScope: 'EU', category: 'vertical_solution', trackingStatus: 'active',
    marketMaturityScore: 79, integrationScore: 67, governanceScore: 83, overallScore: 76, confidence: 84,
    freshnessStatus: 'fresh', asOfDate: '2026-04-10', sourceRunId: 'run-2026-04-11-001', deltaStatus: 'upgraded', openEscalation: false,
  },
  {
    vendorId: 'vendor-005', vendorName: 'Epsilon Cloud', country: 'SE', regionScope: 'EU', category: 'other', trackingStatus: 'inactive',
    marketMaturityScore: 58, integrationScore: 55, governanceScore: 61, overallScore: 58, confidence: 63,
    freshnessStatus: 'unknown', asOfDate: '2026-04-01', sourceRunId: 'run-2026-04-11-001', deltaStatus: 'new', openEscalation: false,
  },
];

const freshnessOrder: Record<VendorListItemDto['freshnessStatus'], number> = {
  fresh: 4,
  stale: 3,
  unknown: 2,
  failed: 1,
};

/**
 * WP-02.2: typed stub dataset until pipeline/read-model contracts are integrated.
 */
export class VendorService {
  public async listVendors(query: VendorListQueryDto): Promise<VendorListResponseDto> {
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.max(1, query.pageSize ?? 10);

    let items = [...STUB_VENDORS];

    if (query.category) {
      items = items.filter((item) => item.category === query.category);
    }

    if (query.trackingStatus) {
      items = items.filter((item) => item.trackingStatus === query.trackingStatus);
    }

    if (query.freshnessStatus) {
      items = items.filter((item) => item.freshnessStatus === query.freshnessStatus);
    }

    if (typeof query.openEscalation === 'boolean') {
      items = items.filter((item) => item.openEscalation === query.openEscalation);
    }

    const sortBy = query.sortBy ?? 'vendorName';
    const sortOrder = query.sortOrder ?? 'asc';

    items.sort((left, right) => {
      let leftValue: string | number = left.vendorName;
      let rightValue: string | number = right.vendorName;

      if (sortBy === 'overallScore') {
        leftValue = left.overallScore;
        rightValue = right.overallScore;
      } else if (sortBy === 'confidence') {
        leftValue = left.confidence;
        rightValue = right.confidence;
      } else if (sortBy === 'freshnessStatus') {
        leftValue = freshnessOrder[left.freshnessStatus];
        rightValue = freshnessOrder[right.freshnessStatus];
      } else if (sortBy === 'asOfDate') {
        leftValue = left.asOfDate;
        rightValue = right.asOfDate;
      }

      if (leftValue < rightValue) {
        return sortOrder === 'asc' ? -1 : 1;
      }

      if (leftValue > rightValue) {
        return sortOrder === 'asc' ? 1 : -1;
      }

      return 0;
    });

    const total = items.length;
    const start = (page - 1) * pageSize;
    const pagedItems = items.slice(start, start + pageSize);

    return {
      items: pagedItems,
      page,
      pageSize,
      total,
    };
  }
}
