// Shared enum definitions for the SCOUT UI/API domain contracts.
// These values are intentionally explicit and stable so that API, frontend,
// and tests can rely on them without guessing.

export const RUN_STATUS = [
  "planned",
  "running",
  "success",
  "partial_success",
  "failed",
] as const;

export const RUN_MODE = [
  "scheduled",
  "manual",
  "dry_run",
  "retry_failed",
  "digest",
] as const;

export const VENDOR_CATEGORY = [
  "platform",
  "framework",
  "orchestration",
  "vertical_solution",
  "other",
] as const;

export const TRACKING_STATUS = [
  "active",
  "inactive",
  "review_queue",
  "blocked",
] as const;

export const FRESHNESS_STATUS = [
  "fresh",
  "stale",
  "failed",
  "unknown",
] as const;

export const DELTA_STATUS = [
  "no_change",
  "changed",
  "new",
  "downgraded",
  "upgraded",
] as const;

export const DELTA_TYPE = [
  "new_vendor_signal",
  "score_change",
  "governance_change",
  "integration_change",
  "maturity_change",
  "source_added",
  "source_removed",
  "confidence_drop",
  "stale_to_failed",
  "failed_to_recovered",
] as const;

export const IMPACTED_DIMENSION = [
  "maturity",
  "integration",
  "governance",
  "confidence",
  "source",
  "freshness",
] as const;

export const REVIEW_STATUS = [
  "open",
  "in_review",
  "accepted",
  "dismissed",
  "escalated",
] as const;

export const SEVERITY = [
  "low",
  "medium",
  "high",
  "critical",
] as const;

export const SOURCE_TYPE = [
  "website",
  "docs",
  "pricing",
  "security",
  "compliance",
  "other",
] as const;

export const CLAIM_TYPE = [
  "pricing",
  "hosting",
  "residency",
  "integrations",
  "security",
  "compliance",
  "roadmap",
  "market_presence",
  "product_capability",
  "support_model",
] as const;

export const REPORT_TYPE = [
  "daily_report",
  "weekly_digest",
] as const;

export const REPORT_STATUS = [
  "draft",
  "in_review",
  "approved",
  "published",
  "archived",
] as const;

export const PUBLICATION_STATE = [
  "internal",
  "released",
  "archived",
] as const;

export const ACTOR_TYPE = [
  "user",
  "system",
  "scheduler",
] as const;

export const AUDIT_ACTION_TYPE = [
  "config_changed",
  "run_started",
  "run_retried",
  "vendor_status_changed",
  "report_approved",
  "override_proposed",
  "override_approved",
  "role_changed",
  "threshold_changed",
  "source_disabled",
] as const;

export const AUDIT_TARGET_TYPE = [
  "config",
  "run",
  "report",
  "vendor",
  "user",
  "role",
  "threshold",
  "source",
] as const;

export const INTERNAL_ROLE = [
  "ROLE_VIEWER",
  "ROLE_ANALYST",
  "ROLE_LEAD_ANALYST",
  "ROLE_OPERATOR",
  "ROLE_ADMIN",
  "ROLE_GOVERNANCE_OWNER",
] as const;
