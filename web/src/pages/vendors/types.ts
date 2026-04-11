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

export interface VendorListResponseDto {
  items: VendorListItemDto[];
  page: number;
  pageSize: number;
  total: number;
}

export interface VendorListQueryState {
  category: string;
  trackingStatus: string;
  freshnessStatus: string;
  openEscalation: string;
  sortBy: 'vendorName' | 'overallScore' | 'confidence' | 'freshnessStatus' | 'asOfDate';
  sortOrder: 'asc' | 'desc';
  page: number;
  pageSize: number;
}
