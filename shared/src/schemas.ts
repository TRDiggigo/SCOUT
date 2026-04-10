import { z } from "zod";
import {
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

const isoDateStringSchema = z.string().min(1);
const nonEmptyStringSchema = z.string().min(1);
const scoreSchema = z.number().min(0).max(100);

export const runStatusSchema = z.enum(RUN_STATUS);
export const runModeSchema = z.enum(RUN_MODE);
export const vendorCategorySchema = z.enum(VENDOR_CATEGORY);
export const trackingStatusSchema = z.enum(TRACKING_STATUS);
export const freshnessStatusSchema = z.enum(FRESHNESS_STATUS);
export const deltaStatusSchema = z.enum(DELTA_STATUS);
export const deltaTypeSchema = z.enum(DELTA_TYPE);
export const impactedDimensionSchema = z.enum(IMPACTED_DIMENSION);
export const reviewStatusSchema = z.enum(REVIEW_STATUS);
export const severitySchema = z.enum(SEVERITY);
export const sourceTypeSchema = z.enum(SOURCE_TYPE);
export const claimTypeSchema = z.enum(CLAIM_TYPE);
export const reportTypeSchema = z.enum(REPORT_TYPE);
export const reportStatusSchema = z.enum(REPORT_STATUS);
export const publicationStateSchema = z.enum(PUBLICATION_STATE);
export const actorTypeSchema = z.enum(ACTOR_TYPE);
export const auditActionTypeSchema = z.enum(AUDIT_ACTION_TYPE);
export const auditTargetTypeSchema = z.enum(AUDIT_TARGET_TYPE);
export const internalRoleSchema = z.enum(INTERNAL_ROLE);

export const runSummarySchema = z.object({
  runId: nonEmptyStringSchema,
  runDate: isoDateStringSchema,
  startedAt: isoDateStringSchema,
  finishedAt: isoDateStringSchema.optional(),
  status: runStatusSchema,
  mode: runModeSchema,
  totalVendors: z.number().int().min(0),
  successVendors: z.number().int().min(0),
  failedVendors: z.number().int().min(0),
  staleVendors: z.number().int().min(0),
  budgetUsedUsd: z.number().min(0),
  budgetLimitUsd: z.number().min(0),
  concurrencyLimit: z.number().int().min(1),
  initiatedBy: z.string().optional(),
  manifestRef: z.string().optional(),
});

export const vendorLatestStateSchema = z.object({
  vendorId: nonEmptyStringSchema,
  vendorName: nonEmptyStringSchema,
  country: z.string().optional(),
  regionScope: z.string().optional(),
  category: vendorCategorySchema,
  trackingStatus: trackingStatusSchema,
  marketMaturityScore: scoreSchema,
  integrationScore: scoreSchema,
  governanceScore: scoreSchema,
  overallScore: scoreSchema,
  confidence: scoreSchema,
  freshnessStatus: freshnessStatusSchema,
  asOfDate: isoDateStringSchema,
  sourceRunId: nonEmptyStringSchema,
  deltaStatus: deltaStatusSchema,
  openEscalation: z.boolean(),
});

export const evidenceRecordSchema = z.object({
  evidenceId: nonEmptyStringSchema,
  vendorId: nonEmptyStringSchema,
  sourceUrl: z.string().url(),
  sourceType: sourceTypeSchema,
  sourceTitle: z.string().optional(),
  extractedAt: isoDateStringSchema,
  claimType: claimTypeSchema,
  claimText: nonEmptyStringSchema,
  normalizedValue: z.string().optional(),
  extractionConfidence: scoreSchema,
  sourcePublic: z.boolean(),
  reviewFlag: z.boolean(),
  runId: nonEmptyStringSchema,
});

export const deltaRecordSchema = z.object({
  deltaId: nonEmptyStringSchema,
  vendorId: nonEmptyStringSchema,
  vendorName: nonEmptyStringSchema,
  deltaDate: isoDateStringSchema,
  deltaType: deltaTypeSchema,
  impactedDimension: impactedDimensionSchema,
  oldValue: z.string().optional(),
  newValue: z.string().optional(),
  severity: severitySchema,
  confidence: scoreSchema,
  sourceRunId: nonEmptyStringSchema,
  detectedBy: nonEmptyStringSchema,
  reviewStatus: reviewStatusSchema,
});

export const reportRecordSchema = z.object({
  reportId: nonEmptyStringSchema,
  reportType: reportTypeSchema,
  reportingPeriod: nonEmptyStringSchema,
  generatedAt: isoDateStringSchema,
  sourceRunId: nonEmptyStringSchema,
  status: reportStatusSchema,
  authorSystem: nonEmptyStringSchema,
  reviewer: z.string().optional(),
  approver: z.string().optional(),
  version: nonEmptyStringSchema,
  exportPaths: z.array(nonEmptyStringSchema).optional(),
  publicationState: publicationStateSchema,
});

export const auditEventSchema = z.object({
  auditEventId: nonEmptyStringSchema,
  eventTime: isoDateStringSchema,
  actorType: actorTypeSchema,
  actorId: nonEmptyStringSchema,
  actionType: auditActionTypeSchema,
  targetType: auditTargetTypeSchema,
  targetId: nonEmptyStringSchema,
  beforeState: z.unknown().optional(),
  afterState: z.unknown().optional(),
  reason: z.string().optional(),
  relatedRunId: z.string().optional(),
  relatedReportId: z.string().optional(),
});

export const runStartRequestSchema = z.object({
  runDate: isoDateStringSchema.optional(),
  vendors: z.array(nonEmptyStringSchema).optional(),
  dryRun: z.boolean().default(false),
});

export const reportApproveRequestSchema = z.object({
  approvalComment: z.string().max(5000).optional(),
});

export const deltaReviewStatusRequestSchema = z.object({
  reviewStatus: reviewStatusSchema,
  comment: z.string().max(5000).optional(),
});

export const configWeightsSchema = z.object({
  weightsVersion: nonEmptyStringSchema,
  marketMaturityWeight: z.number().nonnegative(),
  integrationWeight: z.number().nonnegative(),
  governanceWeight: z.number().nonnegative(),
  effectiveFrom: isoDateStringSchema,
  approvedBy: z.string().optional(),
}).superRefine((value, ctx) => {
  const sum = value.marketMaturityWeight + value.integrationWeight + value.governanceWeight;
  if (!(sum === 100 || Math.abs(sum - 1.0) < 0.000001)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Weights must sum to 100 or 1.0",
      path: ["marketMaturityWeight"],
    });
  }
});

export const internalUserRolesSchema = z.array(internalRoleSchema).min(1);

export type RunSummarySchema = z.infer<typeof runSummarySchema>;
export type VendorLatestStateSchema = z.infer<typeof vendorLatestStateSchema>;
export type EvidenceRecordSchema = z.infer<typeof evidenceRecordSchema>;
export type DeltaRecordSchema = z.infer<typeof deltaRecordSchema>;
export type ReportRecordSchema = z.infer<typeof reportRecordSchema>;
export type AuditEventSchema = z.infer<typeof auditEventSchema>;
