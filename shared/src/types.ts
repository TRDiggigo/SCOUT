import type {
  ACTOR_TYPE,
  AUDIT_ACTION_TYPE,
  AUDIT_TARGET_TYPE,
  CLAIM_TYPE,
  DELTA_STATUS,
  DELTA_TYPE,
  FRESHNESS_STATUS,
  IMPACTED_DIMENSION,
  INTERNAL_ROLE,
  PUBLICATION_STATE,
  REPORT_STATUS,
  REPORT_TYPE,
  REVIEW_STATUS,
  RUN_MODE,
  RUN_STATUS,
  SEVERITY,
  SOURCE_TYPE,
  TRACKING_STATUS,
  VENDOR_CATEGORY,
} from "./enums";

export type RunStatus = (typeof RUN_STATUS)[number];
export type RunMode = (typeof RUN_MODE)[number];
export type VendorCategory = (typeof VENDOR_CATEGORY)[number];
export type TrackingStatus = (typeof TRACKING_STATUS)[number];
export type FreshnessStatus = (typeof FRESHNESS_STATUS)[number];
export type DeltaStatus = (typeof DELTA_STATUS)[number];
export type DeltaType = (typeof DELTA_TYPE)[number];
export type ImpactedDimension = (typeof IMPACTED_DIMENSION)[number];
export type ReviewStatus = (typeof REVIEW_STATUS)[number];
export type Severity = (typeof SEVERITY)[number];
export type SourceType = (typeof SOURCE_TYPE)[number];
export type ClaimType = (typeof CLAIM_TYPE)[number];
export type ReportType = (typeof REPORT_TYPE)[number];
export type ReportStatus = (typeof REPORT_STATUS)[number];
export type PublicationState = (typeof PUBLICATION_STATE)[number];
export type ActorType = (typeof ACTOR_TYPE)[number];
export type AuditActionType = (typeof AUDIT_ACTION_TYPE)[number];
export type AuditTargetType = (typeof AUDIT_TARGET_TYPE)[number];
export type InternalRole = (typeof INTERNAL_ROLE)[number];

export interface RunSummary {
  runId: string;
  runDate: string;
  startedAt: string;
  finishedAt?: string;
  status: RunStatus;
  mode: RunMode;
  totalVendors: number;
  successVendors: number;
  failedVendors: number;
  staleVendors: number;
  budgetUsedUsd: number;
  budgetLimitUsd: number;
  concurrencyLimit: number;
  initiatedBy?: string;
  manifestRef?: string;
}

export interface VendorLatestState {
  vendorId: string;
  vendorName: string;
  country?: string;
  regionScope?: string;
  category: VendorCategory;
  trackingStatus: TrackingStatus;
  marketMaturityScore: number;
  integrationScore: number;
  governanceScore: number;
  overallScore: number;
  confidence: number;
  freshnessStatus: FreshnessStatus;
  asOfDate: string;
  sourceRunId: string;
  deltaStatus: DeltaStatus;
  openEscalation: boolean;
}

export interface EvidenceRecord {
  evidenceId: string;
  vendorId: string;
  sourceUrl: string;
  sourceType: SourceType;
  sourceTitle?: string;
  extractedAt: string;
  claimType: ClaimType;
  claimText: string;
  normalizedValue?: string;
  extractionConfidence: number;
  sourcePublic: boolean;
  reviewFlag: boolean;
  runId: string;
}

export interface DeltaRecord {
  deltaId: string;
  vendorId: string;
  vendorName: string;
  deltaDate: string;
  deltaType: DeltaType;
  impactedDimension: ImpactedDimension;
  oldValue?: string;
  newValue?: string;
  severity: Severity;
  confidence: number;
  sourceRunId: string;
  detectedBy: string;
  reviewStatus: ReviewStatus;
}

export interface ReportRecord {
  reportId: string;
  reportType: ReportType;
  reportingPeriod: string;
  generatedAt: string;
  sourceRunId: string;
  status: ReportStatus;
  authorSystem: string;
  reviewer?: string;
  approver?: string;
  version: string;
  exportPaths?: string[];
  publicationState: PublicationState;
}

export interface AuditEvent {
  auditEventId: string;
  eventTime: string;
  actorType: ActorType;
  actorId: string;
  actionType: AuditActionType;
  targetType: AuditTargetType;
  targetId: string;
  beforeState?: unknown;
  afterState?: unknown;
  reason?: string;
  relatedRunId?: string;
  relatedReportId?: string;
}

export interface RunStartRequest {
  runDate?: string;
  vendors?: string[];
  dryRun: boolean;
}

export interface ReportApproveRequest {
  approvalComment?: string;
}

export interface DeltaReviewStatusRequest {
  reviewStatus: ReviewStatus;
  comment?: string;
}

export interface ConfigWeights {
  weightsVersion: string;
  marketMaturityWeight: number;
  integrationWeight: number;
  governanceWeight: number;
  effectiveFrom: string;
  approvedBy?: string;
}
