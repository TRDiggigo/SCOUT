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

export interface VendorDetailDto {
  vendorId: string;
  vendorName: string;
  legalEntityName: string;
  websiteUrl: string;
  headquartersCountry: string;
  euPresence: boolean;
  category: VendorListItemDto['category'];
  shortDescription: string;
  trackingStatus: VendorListItemDto['trackingStatus'];
  reviewQueueReason: string | null;
  marketMaturityScore: number;
  integrationScore: number;
  governanceScore: number;
  overallScore: number;
  confidence: number;
  confidenceReason: string;
  scoringRubricVersion: string;
  secondOpinionModel: string;
  scoreDivergencePct: number;
  asOfDate: string;
  sourceRunId: string;
  freshnessStatus: VendorListItemDto['freshnessStatus'];
  latestRunId: string;
  latestManifestRef: string;
  snapshotPath: string;
  euHostingClaim: boolean;
  dataResidencyEu: 'yes' | 'partial' | 'no' | 'unknown';
  identityIntegration: 'none' | 'sso' | 'scim' | 'sso_scim' | 'unknown';
  ssoSupport: boolean;
  auditLoggingClaim: boolean;
  complianceClaims: string[];
  securityDisclosures: string;
  humanReviewRequired: boolean;
  sourceCount: number;
  latestEvidenceCount: number;
  primarySources: string[];
  sourceQualityFlag: 'high' | 'medium' | 'low' | 'mixed';
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

export interface VendorCompareItemDto {
  vendorId: string;
  vendorName: string;
  category: VendorListItemDto['category'];
  overallScore: number;
  confidence: number;
  freshnessStatus: VendorListItemDto['freshnessStatus'];
  asOfDate: string;
  sourceRunId: string;
}

export interface VendorCompareResponseDto {
  items: VendorCompareItemDto[];
}
