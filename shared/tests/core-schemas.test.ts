import { describe, expect, it } from "vitest";
import {
  auditEventSchema,
  deltaRecordSchema,
  evidenceRecordSchema,
  reportRecordSchema,
  runSummarySchema,
  vendorLatestStateSchema,
} from "../src/index";

describe("runSummarySchema", () => {
  it("accepts a valid run summary", () => {
    const result = runSummarySchema.safeParse({
      runId: "2026-04-10T080000Z-abc123-1",
      runDate: "2026-04-10",
      startedAt: "2026-04-10T08:00:00Z",
      finishedAt: "2026-04-10T08:05:00Z",
      status: "success",
      mode: "scheduled",
      totalVendors: 10,
      successVendors: 9,
      failedVendors: 1,
      staleVendors: 0,
      budgetUsedUsd: 4.25,
      budgetLimitUsd: 10,
      concurrencyLimit: 3,
      initiatedBy: "scheduler",
      manifestRef: "/SCOUT/data/2026-04-10/latest/latest.manifest.json",
    });

    expect(result.success).toBe(true);
  });

  it("rejects a run summary with invalid status", () => {
    const result = runSummarySchema.safeParse({
      runId: "r-1",
      runDate: "2026-04-10",
      startedAt: "2026-04-10T08:00:00Z",
      status: "done",
      mode: "scheduled",
      totalVendors: 1,
      successVendors: 1,
      failedVendors: 0,
      staleVendors: 0,
      budgetUsedUsd: 1,
      budgetLimitUsd: 10,
      concurrencyLimit: 1,
    });

    expect(result.success).toBe(false);
  });
});

describe("vendorLatestStateSchema", () => {
  it("accepts a valid vendor latest state", () => {
    const result = vendorLatestStateSchema.safeParse({
      vendorId: "vendor-openai",
      vendorName: "OpenAI",
      country: "US",
      regionScope: "Global-EU",
      category: "platform",
      trackingStatus: "active",
      marketMaturityScore: 88,
      integrationScore: 84,
      governanceScore: 72,
      overallScore: 82,
      confidence: 78,
      freshnessStatus: "fresh",
      asOfDate: "2026-04-10",
      sourceRunId: "2026-04-10T080000Z-abc123-1",
      deltaStatus: "changed",
      openEscalation: false,
    });

    expect(result.success).toBe(true);
  });

  it("rejects a vendor latest state with score > 100", () => {
    const result = vendorLatestStateSchema.safeParse({
      vendorId: "vendor-openai",
      vendorName: "OpenAI",
      category: "platform",
      trackingStatus: "active",
      marketMaturityScore: 101,
      integrationScore: 84,
      governanceScore: 72,
      overallScore: 82,
      confidence: 78,
      freshnessStatus: "fresh",
      asOfDate: "2026-04-10",
      sourceRunId: "2026-04-10T080000Z-abc123-1",
      deltaStatus: "changed",
      openEscalation: false,
    });

    expect(result.success).toBe(false);
  });
});

describe("evidenceRecordSchema", () => {
  it("accepts a valid evidence record", () => {
    const result = evidenceRecordSchema.safeParse({
      evidenceId: "ev-1",
      vendorId: "vendor-openai",
      sourceUrl: "https://example.com/security",
      sourceType: "security",
      sourceTitle: "Security Overview",
      extractedAt: "2026-04-10T08:03:00Z",
      claimType: "security",
      claimText: "SOC 2 information available.",
      normalizedValue: "soc2-listed",
      extractionConfidence: 81,
      sourcePublic: true,
      reviewFlag: false,
      runId: "2026-04-10T080000Z-abc123-1",
    });

    expect(result.success).toBe(true);
  });

  it("rejects an evidence record with invalid URL", () => {
    const result = evidenceRecordSchema.safeParse({
      evidenceId: "ev-1",
      vendorId: "vendor-openai",
      sourceUrl: "not-a-url",
      sourceType: "security",
      extractedAt: "2026-04-10T08:03:00Z",
      claimType: "security",
      claimText: "SOC 2 information available.",
      extractionConfidence: 81,
      sourcePublic: true,
      reviewFlag: false,
      runId: "2026-04-10T080000Z-abc123-1",
    });

    expect(result.success).toBe(false);
  });
});

describe("deltaRecordSchema", () => {
  it("accepts a valid delta record", () => {
    const result = deltaRecordSchema.safeParse({
      deltaId: "delta-1",
      vendorId: "vendor-openai",
      vendorName: "OpenAI",
      deltaDate: "2026-04-10",
      deltaType: "governance_change",
      impactedDimension: "governance",
      oldValue: "unknown",
      newValue: "eu-hosting-claim",
      severity: "medium",
      confidence: 74,
      sourceRunId: "2026-04-10T080000Z-abc123-1",
      detectedBy: "a4-delta",
      reviewStatus: "open",
    });

    expect(result.success).toBe(true);
  });

  it("rejects a delta record with invalid severity", () => {
    const result = deltaRecordSchema.safeParse({
      deltaId: "delta-1",
      vendorId: "vendor-openai",
      vendorName: "OpenAI",
      deltaDate: "2026-04-10",
      deltaType: "governance_change",
      impactedDimension: "governance",
      severity: "urgent",
      confidence: 74,
      sourceRunId: "2026-04-10T080000Z-abc123-1",
      detectedBy: "a4-delta",
      reviewStatus: "open",
    });

    expect(result.success).toBe(false);
  });
});

describe("reportRecordSchema", () => {
  it("accepts a valid report record", () => {
    const result = reportRecordSchema.safeParse({
      reportId: "report-2026-04-10",
      reportType: "daily_report",
      reportingPeriod: "2026-04-10",
      generatedAt: "2026-04-10T08:10:00Z",
      sourceRunId: "2026-04-10T080000Z-abc123-1",
      status: "draft",
      authorSystem: "scout-a5",
      reviewer: "analyst@example.com",
      version: "v1",
      exportPaths: ["/SCOUT/data/2026-04-10/latest/report.md"],
      publicationState: "internal",
    });

    expect(result.success).toBe(true);
  });

  it("rejects a report record with invalid publication state", () => {
    const result = reportRecordSchema.safeParse({
      reportId: "report-2026-04-10",
      reportType: "daily_report",
      reportingPeriod: "2026-04-10",
      generatedAt: "2026-04-10T08:10:00Z",
      sourceRunId: "2026-04-10T080000Z-abc123-1",
      status: "draft",
      authorSystem: "scout-a5",
      version: "v1",
      publicationState: "public",
    });

    expect(result.success).toBe(false);
  });
});

describe("auditEventSchema", () => {
  it("accepts a valid audit event", () => {
    const result = auditEventSchema.safeParse({
      auditEventId: "audit-1",
      eventTime: "2026-04-10T08:11:00Z",
      actorType: "user",
      actorId: "torsten@example.com",
      actionType: "config_changed",
      targetType: "config",
      targetId: "weights",
      beforeState: { governanceWeight: 30 },
      afterState: { governanceWeight: 35 },
      reason: "Governance weighting adjustment",
      relatedRunId: "2026-04-10T080000Z-abc123-1",
    });

    expect(result.success).toBe(true);
  });

  it("rejects an audit event with invalid actor type", () => {
    const result = auditEventSchema.safeParse({
      auditEventId: "audit-1",
      eventTime: "2026-04-10T08:11:00Z",
      actorType: "admin_user",
      actorId: "torsten@example.com",
      actionType: "config_changed",
      targetType: "config",
      targetId: "weights",
    });

    expect(result.success).toBe(false);
  });
});
