# SCOUT Technical Implementation Specification for Codex
Version: 0.1
Status: Draft
Target Repository: `TRDiggigo/SCOUT`
Audience: Codex, Engineering, Architecture, Product, Governance

## 1. Objective

This document translates the UI functional specification into an implementation-ready technical specification.

SCOUT already provides a CLI-based processing core with:

- pipeline stages A1 to A6
- evidence extraction into `evidence.json`
- scoring into `scores.json`
- delta detection against prior `latest/`
- markdown report generation
- SharePoint persistence
- run idempotency and provenance
- guardrails for public sources, no vendor contact, no auto-add, confidence/divergence escalation

The target solution must preserve this existing processing core and add:

1. application API layer
2. web frontend
3. RBAC
4. audit-capable mutation handling
5. optional read-model storage for fast UI queries

---

## 2. Existing Constraints Derived from Repository

The implementation must align with the current repository shape and behavior:

- SCOUT is currently structured as a CLI application.
- The current architecture is centered on `src/index.js`, `src/pipeline.js`, `src/tasks`, `src/llm`, `src/sharepoint`, `src/scoring`, `src/evidence`, `src/config`, `src/util`.
- Config seeds exist for vendors, weights, sources, providers.
- Runs are idempotent and produce `run_id`, run artifacts, `latest/` promotion, and `latest.manifest.json`.
- Dashboard logic must be able to surface `stale` and `failed` vendors.
- Escalations must be generated for low confidence and score divergence conditions.

This means the UI/API implementation must be additive and non-destructive.

---

## 3. Recommended Target Architecture

## 3.1 Layers

### Layer 1: Processing Core (existing)
Responsibility:
- A1 to A6 execution
- artifact generation
- config loading
- persistence
- scoring
- delta detection

### Layer 2: Application API (new)
Responsibility:
- expose read models to frontend
- expose safe mutation endpoints
- enforce RBAC
- create audit events
- orchestrate run control
- validate configuration changes

### Layer 3: Web UI (new)
Responsibility:
- analyst workspace
- admin/operations console
- route-level authorization
- search/filter/detail pages

### Layer 4: Optional Operational Read Model (new, recommended)
Responsibility:
- accelerate dashboard and table queries
- de-normalize latest vendor state
- cache run summaries and error summaries
- avoid rendering large SharePoint payloads directly in UI

---

## 4. Recommended Technology Decisions

## 4.1 Backend
Recommended:
- Node.js >= 20
- Fastify preferred, Express acceptable
- Zod for request/response validation
- TypeScript for all new API code

Reason:
- current project is Node-based
- TypeScript improves Codex output quality
- Fastify gives strong plugin, validation, and typing support

## 4.2 Frontend
Recommended:
- React + Vite
- TypeScript
- React Router
- TanStack Query
- Zod for client validation where useful
- simple CSS system or Tailwind depending team preference

Reason:
- clean separation from CLI
- fast implementation
- Codex-friendly scaffolding
- good route modularity

## 4.3 Auth
Recommended:
- Entra ID / Microsoft Identity
- backend validates bearer token
- frontend uses OIDC login flow
- roles resolved from app roles or groups

## 4.4 Optional Read Model Storage
Recommended:
- SQLite for local/dev bootstrap
- PostgreSQL for production-hardening

Reason:
- latest snapshot and dashboard pages benefit from fast structured reads

---

## 5. Repository Target Structure

```text
SCOUT/
├─ src/                              # existing processing core, unchanged in role
│  ├─ index.js
│  ├─ pipeline.js
│  ├─ tasks/
│  ├─ llm/
│  ├─ sharepoint/
│  ├─ scoring/
│  ├─ evidence/
│  ├─ config/
│  └─ util/
│
├─ api/                              # new application API
│  ├─ package.json
│  ├─ tsconfig.json
│  ├─ src/
│  │  ├─ server.ts
│  │  ├─ app.ts
│  │  ├─ routes/
│  │  │  ├─ dashboard.routes.ts
│  │  │  ├─ vendors.routes.ts
│  │  │  ├─ deltas.routes.ts
│  │  │  ├─ evidence.routes.ts
│  │  │  ├─ reports.routes.ts
│  │  │  ├─ runs.routes.ts
│  │  │  ├─ errors.routes.ts
│  │  │  ├─ config.routes.ts
│  │  │  ├─ audit.routes.ts
│  │  │  └─ admin.routes.ts
│  │  ├─ middleware/
│  │  │  ├─ auth.ts
│  │  │  ├─ role-guard.ts
│  │  │  ├─ audit-write.ts
│  │  │  ├─ error-handler.ts
│  │  │  └─ request-context.ts
│  │  ├─ domain/
│  │  │  ├─ types/
│  │  │  ├─ enums/
│  │  │  └─ schemas/
│  │  ├─ services/
│  │  │  ├─ dashboard.service.ts
│  │  │  ├─ vendor.service.ts
│  │  │  ├─ delta.service.ts
│  │  │  ├─ evidence.service.ts
│  │  │  ├─ report.service.ts
│  │  │  ├─ run.service.ts
│  │  │  ├─ error.service.ts
│  │  │  ├─ config.service.ts
│  │  │  ├─ audit.service.ts
│  │  │  ├─ admin.service.ts
│  │  │  └─ sharepoint-admin.service.ts
│  │  ├─ repositories/
│  │  │  ├─ latest-snapshot.repository.ts
│  │  │  ├─ runs.repository.ts
│  │  │  ├─ audit.repository.ts
│  │  │  ├─ config.repository.ts
│  │  │  ├─ errors.repository.ts
│  │  │  └─ users.repository.ts
│  │  ├─ adapters/
│  │  │  ├─ pipeline.adapter.ts
│  │  │  ├─ sharepoint.adapter.ts
│  │  │  └─ read-model.adapter.ts
│  │  ├─ auth/
│  │  │  ├─ entra-jwt.ts
│  │  │  └─ role-mapper.ts
│  │  ├─ jobs/
│  │  │  └─ run-trigger.job.ts
│  │  └─ util/
│  │     ├─ logger.ts
│  │     ├─ pagination.ts
│  │     ├─ filters.ts
│  │     └─ response.ts
│  └─ tests/
│
├─ web/                              # new frontend
│  ├─ package.json
│  ├─ tsconfig.json
│  ├─ vite.config.ts
│  ├─ src/
│  │  ├─ main.tsx
│  │  ├─ app/
│  │  │  ├─ router.tsx
│  │  │  ├─ AppShell.tsx
│  │  │  └─ guards/
│  │  ├─ pages/
│  │  │  ├─ dashboard/
│  │  │  ├─ vendors/
│  │  │  ├─ deltas/
│  │  │  ├─ evidence/
│  │  │  ├─ reports/
│  │  │  ├─ runs/
│  │  │  ├─ errors/
│  │  │  ├─ config/
│  │  │  ├─ audit/
│  │  │  └─ admin/
│  │  ├─ components/
│  │  ├─ features/
│  │  ├─ api/
│  │  ├─ auth/
│  │  ├─ hooks/
│  │  ├─ lib/
│  │  ├─ models/
│  │  └─ styles/
│  └─ tests/
│
├─ shared/                           # shared TS domain contracts
│  ├─ package.json
│  └─ src/
│     ├─ enums.ts
│     ├─ types.ts
│     ├─ schemas.ts
│     └─ index.ts
│
├─ docs/
│  ├─ SCOUT_UI_Fachkonzept_Codex.md
│  └─ SCOUT_Technische_Umsetzung_Codex.md
│
└─ tests/
```

---

## 6. New Domain Model

## 6.1 Core TypeScript Domain Types

```ts
export type UUID = string;

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
```

---

## 6.2 Enums

```ts
export type RunStatus =
  | "planned"
  | "running"
  | "success"
  | "partial_success"
  | "failed";

export type RunMode =
  | "scheduled"
  | "manual"
  | "dry_run"
  | "retry_failed"
  | "digest";

export type VendorCategory =
  | "platform"
  | "framework"
  | "orchestration"
  | "vertical_solution"
  | "other";

export type TrackingStatus =
  | "active"
  | "inactive"
  | "review_queue"
  | "blocked";

export type FreshnessStatus =
  | "fresh"
  | "stale"
  | "failed"
  | "unknown";

export type DeltaStatus =
  | "no_change"
  | "changed"
  | "new"
  | "downgraded"
  | "upgraded";

export type DeltaType =
  | "new_vendor_signal"
  | "score_change"
  | "governance_change"
  | "integration_change"
  | "maturity_change"
  | "source_added"
  | "source_removed"
  | "confidence_drop"
  | "stale_to_failed"
  | "failed_to_recovered";

export type ReviewStatus =
  | "open"
  | "in_review"
  | "accepted"
  | "dismissed"
  | "escalated";

export type Severity =
  | "low"
  | "medium"
  | "high"
  | "critical";

export type ClaimType =
  | "pricing"
  | "hosting"
  | "residency"
  | "integrations"
  | "security"
  | "compliance"
  | "roadmap"
  | "market_presence"
  | "product_capability"
  | "support_model";

export type ReportType =
  | "daily_report"
  | "weekly_digest";

export type ReportStatus =
  | "draft"
  | "in_review"
  | "approved"
  | "published"
  | "archived";

export type PublicationState =
  | "internal"
  | "released"
  | "archived";

export type ActorType =
  | "user"
  | "system"
  | "scheduler";
```

---

## 7. Zod Schemas

## 7.1 Base Schemas

```ts
import { z } from "zod";

export const runStatusSchema = z.enum([
  "planned",
  "running",
  "success",
  "partial_success",
  "failed",
]);

export const runModeSchema = z.enum([
  "scheduled",
  "manual",
  "dry_run",
  "retry_failed",
  "digest",
]);

export const vendorCategorySchema = z.enum([
  "platform",
  "framework",
  "orchestration",
  "vertical_solution",
  "other",
]);

export const trackingStatusSchema = z.enum([
  "active",
  "inactive",
  "review_queue",
  "blocked",
]);

export const freshnessStatusSchema = z.enum([
  "fresh",
  "stale",
  "failed",
  "unknown",
]);

export const vendorLatestStateSchema = z.object({
  vendorId: z.string().min(1),
  vendorName: z.string().min(1),
  country: z.string().optional(),
  regionScope: z.string().optional(),
  category: vendorCategorySchema,
  trackingStatus: trackingStatusSchema,
  marketMaturityScore: z.number().min(0).max(100),
  integrationScore: z.number().min(0).max(100),
  governanceScore: z.number().min(0).max(100),
  overallScore: z.number().min(0).max(100),
  confidence: z.number().min(0).max(100),
  freshnessStatus: freshnessStatusSchema,
  asOfDate: z.string().min(1),
  sourceRunId: z.string().min(1),
  deltaStatus: z.enum(["no_change", "changed", "new", "downgraded", "upgraded"]),
  openEscalation: z.boolean(),
});
```

## 7.2 Mutation Schemas

```ts
export const runStartRequestSchema = z.object({
  runDate: z.string().optional(),
  vendors: z.array(z.string()).optional(),
  dryRun: z.boolean().default(false),
});

export const reportApproveRequestSchema = z.object({
  approvalComment: z.string().max(5000).optional(),
});

export const deltaReviewStatusRequestSchema = z.object({
  reviewStatus: z.enum(["open", "in_review", "accepted", "dismissed", "escalated"]),
  comment: z.string().max(5000).optional(),
});

export const configWeightsSchema = z.object({
  weightsVersion: z.string().min(1),
  marketMaturityWeight: z.number().nonnegative(),
  integrationWeight: z.number().nonnegative(),
  governanceWeight: z.number().nonnegative(),
  effectiveFrom: z.string().min(1),
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
```

---

## 8. API Contract

## 8.1 Versioning and Conventions

- base path: `/api/v1`
- all list endpoints support:
  - `page`
  - `pageSize`
  - `sortBy`
  - `sortOrder`
  - structured filters where applicable
- all mutation endpoints require JWT auth and server-side role guard
- all successful mutations must emit audit events
- all analytical detail endpoints must expose provenance references

## 8.2 Endpoint Definitions

### Dashboard
- `GET /api/v1/dashboard`

Response:
```ts
interface DashboardResponse {
  latestRun: RunSummary | null;
  activeVendorCount: number;
  changedVendorCount: number;
  staleVendorCount: number;
  failedVendorCount: number;
  escalationCountOpen: number;
  avgMarketMaturity: number;
  avgIntegration: number;
  avgGovernance: number;
  budgetUsedUsd: number;
  budgetLimitUsd: number;
}
```

### Vendors
- `GET /api/v1/vendors`
- `GET /api/v1/vendors/:vendorId`
- `POST /api/v1/vendors/compare`
- `POST /api/v1/vendors/:vendorId/mark-review`
- `POST /api/v1/vendors/:vendorId/activate`
- `POST /api/v1/vendors/:vendorId/deactivate`

### Deltas
- `GET /api/v1/deltas`
- `GET /api/v1/deltas/:deltaId`
- `POST /api/v1/deltas/:deltaId/review-status`
- `POST /api/v1/deltas/:deltaId/mark-report-relevant`

### Evidence
- `GET /api/v1/evidence`
- `GET /api/v1/evidence/:evidenceId`
- `POST /api/v1/evidence/:evidenceId/review-flag`

### Reports
- `GET /api/v1/reports`
- `GET /api/v1/reports/:reportId`
- `POST /api/v1/reports/:reportId/approve`
- `POST /api/v1/reports/:reportId/regenerate`
- `GET /api/v1/reports/:reportId/export`

### Runs
- `GET /api/v1/runs`
- `GET /api/v1/runs/:runId`
- `POST /api/v1/runs`
- `POST /api/v1/runs/:runId/retry-failed`

### Errors
- `GET /api/v1/errors`
- `POST /api/v1/errors/:errorId/assign`
- `POST /api/v1/errors/:errorId/status`

### Config
- `GET /api/v1/config/vendors`
- `PUT /api/v1/config/vendors`
- `GET /api/v1/config/weights`
- `PUT /api/v1/config/weights`
- `GET /api/v1/config/sources`
- `PUT /api/v1/config/sources`
- `GET /api/v1/config/providers`
- `PUT /api/v1/config/providers`
- `GET /api/v1/config/limits`
- `PUT /api/v1/config/limits`
- `POST /api/v1/config/validate`

### Audit
- `GET /api/v1/audit`

### Admin
- `GET /api/v1/admin/users`
- `PUT /api/v1/admin/users/:userId`
- `GET /api/v1/admin/roles`
- `GET /api/v1/admin/sharepoint`
- `POST /api/v1/admin/sharepoint/validate`

---

## 9. Backend Module Responsibilities

## 9.1 Route Layer
Responsibility:
- request validation
- auth middleware attachment
- role guard attachment
- response shaping

Rule:
- routes must not contain business logic

## 9.2 Service Layer
Responsibility:
- orchestration
- business rules
- audit writes
- error normalization
- repository coordination

## 9.3 Repository Layer
Responsibility:
- read/write access to SharePoint-backed structures and optional read model DB
- map low-level storage into typed domain records

## 9.4 Adapter Layer
Responsibility:
- bridge API layer to existing CLI/pipeline code
- invoke run execution
- validate compatibility
- avoid duplicate business logic

---

## 10. Integration Strategy with Existing Processing Core

## 10.1 Principle
Do not reimplement the pipeline in the API layer.

## 10.2 Required Adapters

### pipeline.adapter.ts
Responsibilities:
- start new run
- start dry run
- retry failed vendors
- check run status
- read produced artifact locations

### sharepoint.adapter.ts
Responsibilities:
- read latest snapshots
- read manifests
- read reports
- validate connection target
- resolve config paths

### read-model.adapter.ts
Responsibilities:
- ingest latest snapshot into operational query model
- expose indexed data access
- refresh caches after successful promotion to `latest/`

## 10.3 Trigger Strategy
Recommended first implementation:
- API run endpoint calls backend service
- backend service invokes pipeline adapter
- pipeline adapter spawns or invokes existing run logic
- upon successful completion:
  - refresh read model
  - emit audit event
  - update run status cache

---

## 11. Read Model Design

## 11.1 Why a Read Model
Current artifacts are optimized for processing and persistence, not UI query speed.

A read model should denormalize:
- latest vendor state
- open escalations
- recent deltas
- recent reports
- recent run summaries
- unresolved errors

## 11.2 Suggested Tables

### latest_vendor_state
- vendor_id
- vendor_name
- country
- region_scope
- category
- tracking_status
- market_maturity_score
- integration_score
- governance_score
- overall_score
- confidence
- freshness_status
- as_of_date
- source_run_id
- delta_status
- open_escalation
- updated_at

### run_summary
- run_id
- run_date
- started_at
- finished_at
- status
- mode
- total_vendors
- success_vendors
- failed_vendors
- stale_vendors
- budget_used_usd
- budget_limit_usd
- concurrency_limit
- initiated_by
- manifest_ref

### evidence_index
- evidence_id
- vendor_id
- source_url
- source_type
- source_title
- extracted_at
- claim_type
- extraction_confidence
- run_id
- review_flag

### delta_index
- delta_id
- vendor_id
- delta_date
- delta_type
- impacted_dimension
- severity
- confidence
- review_status
- source_run_id

### report_index
- report_id
- report_type
- reporting_period
- generated_at
- source_run_id
- status
- version
- publication_state

### audit_event
- audit_event_id
- event_time
- actor_type
- actor_id
- action_type
- target_type
- target_id
- reason
- related_run_id
- related_report_id

### error_index
- error_id
- run_id
- vendor_id
- stage
- error_type
- severity
- resolution_status
- retry_status
- assigned_to
- first_seen_at

---

## 12. Auth and RBAC

## 12.1 Authentication Flow
Recommended:
- frontend redirects to Entra login
- frontend stores access token in memory
- frontend sends bearer token to API
- backend validates token signature, issuer, audience
- backend maps groups/app roles to internal roles

## 12.2 Internal Roles
- ROLE_VIEWER
- ROLE_ANALYST
- ROLE_LEAD_ANALYST
- ROLE_OPERATOR
- ROLE_ADMIN
- ROLE_GOVERNANCE_OWNER

## 12.3 RBAC Middleware Pattern

```ts
export function requireRoles(...allowedRoles: InternalRole[]) {
  return async (request, reply) => {
    const user = request.user;
    if (!user) {
      return reply.code(401).send({ error: "Unauthorized" });
    }
    const allowed = user.roles.some(role => allowedRoles.includes(role));
    if (!allowed) {
      return reply.code(403).send({ error: "Forbidden" });
    }
  };
}
```

## 12.4 Route Protection Matrix
- analyst routes: viewer+
- admin config mutations: admin only
- report approval: lead analyst, admin, governance owner
- run control: operator, admin
- audit read: admin, governance owner

---

## 13. Audit Design

## 13.1 Mandatory Audit Events
Every mutation must create an audit event for:
- config change
- run start
- retry failed
- report approval
- vendor activation/deactivation
- delta review finalization
- user role change
- threshold change
- source disablement

## 13.2 Audit Event Shape

```ts
export interface AuditWriteRequest {
  actionType: AuditActionType;
  targetType: AuditTargetType;
  targetId: string;
  actorId: string;
  actorType: "user" | "system" | "scheduler";
  reason?: string;
  beforeState?: unknown;
  afterState?: unknown;
  relatedRunId?: string;
  relatedReportId?: string;
}
```

## 13.3 Audit Middleware Strategy
Recommended:
- service layer builds audit payload
- repository persists audit record after successful mutation
- if audit write fails, mutation should fail unless explicitly configured otherwise

---

## 14. Error Handling Strategy

## 14.1 Error Normalization
All backend errors must be normalized into:
- code
- message
- details
- correlationId

## 14.2 Error Categories
- validation_error
- auth_error
- forbidden_error
- not_found
- conflict
- provider_error
- pipeline_error
- sharepoint_error
- read_model_error
- internal_error

## 14.3 API Error Response

```ts
interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
    correlationId: string;
  };
}
```

---

## 15. Frontend Application Design

## 15.1 Route Structure

```text
/app/dashboard
/app/vendors
/app/vendors/:vendorId
/app/vendors/compare
/app/deltas
/app/deltas/:deltaId
/app/evidence
/app/evidence/:evidenceId
/app/reports
/app/reports/:reportId

/admin/runs
/admin/runs/:runId
/admin/errors
/admin/config
/admin/config/vendors
/admin/config/weights
/admin/config/sources
/admin/config/providers
/admin/config/limits
/admin/audit
/admin/users
/admin/roles
/admin/sharepoint
```

## 15.2 Frontend Module Pattern
Per feature folder:
- `index.ts`
- `api.ts`
- `types.ts`
- `queries.ts`
- `components/`
- `pages/`

Example:
```text
web/src/pages/vendors/
├─ index.ts
├─ api.ts
├─ types.ts
├─ queries.ts
├─ VendorListPage.tsx
├─ VendorDetailPage.tsx
└─ components/
```

## 15.3 Shared UI Components
- `DataTable`
- `FilterBar`
- `PageHeader`
- `DetailSection`
- `StatusBadge`
- `ScoreBadge`
- `ConfidenceBadge`
- `SeverityBadge`
- `JsonViewer`
- `EmptyState`
- `ErrorState`
- `LoadingState`
- `RoleGuard`
- `ConfirmDialog`

---

## 16. Frontend State and Data Fetching

## 16.1 Server State
Use TanStack Query for:
- list queries
- detail queries
- mutations
- invalidation after mutation

## 16.2 Local UI State
Use local component state or small store for:
- compare selections
- table preferences
- panel toggles
- active filters

## 16.3 Query Key Standard
Example:
```ts
["dashboard"]
["vendors", filters]
["vendor", vendorId]
["deltas", filters]
["evidence", filters]
["reports", filters]
["run", runId]
```

---

## 17. DTO and Mapper Pattern

## 17.1 Principle
The API should expose DTOs explicitly. Frontend should not consume raw repository payloads.

## 17.2 Example
```ts
export interface VendorListItemDto {
  vendorId: string;
  vendorName: string;
  country?: string;
  category: VendorCategory;
  overallScore: number;
  confidence: number;
  freshnessStatus: FreshnessStatus;
  deltaStatus: DeltaStatus;
  openEscalation: boolean;
}
```

## 17.3 Mapper Location
- backend: repository model -> DTO mapper
- frontend: DTO -> view model only when needed

---

## 18. Configuration Handling

## 18.1 Configuration Sources
Configuration is currently seeded via:
- `vendors.json`
- `weights.json`
- `sources.json`
- `providers.json`

The API must treat configuration as managed domain state.

## 18.2 Config Mutation Rules
- all config edits require admin role
- governance-relevant config may require governance approval flag
- every config change requires:
  - schema validation
  - audit event
  - version stamp
  - actor identity

## 18.3 Config Validation Endpoint
`POST /api/v1/config/validate`

Purpose:
- validate remote config shape before save or before run

Response:
```ts
interface ConfigValidationResponse {
  valid: boolean;
  errors: Array<{
    path: string;
    message: string;
  }>;
}
```

---

## 19. Suggested Test Strategy

## 19.1 API Tests
Use:
- Vitest or Jest
- supertest for route tests

Required coverage:
- auth required
- role guard enforcement
- list pagination
- filter correctness
- mutation validation
- audit event creation
- error normalization

## 19.2 Service Tests
Required coverage:
- run start orchestration
- retry-failed orchestration
- vendor activation/deactivation
- config weight validation
- report approval flow
- escalation generation

## 19.3 Frontend Tests
Use:
- Vitest
- React Testing Library

Required coverage:
- route rendering
- role-based UI visibility
- table loading/error states
- mutation success/error handling
- compare workflow

## 19.4 End-to-End Tests
Use:
- Playwright recommended

Required coverage:
- login -> dashboard
- vendor detail view
- delta review update
- report approval
- run control page
- config validation page

---

## 20. Suggested Ticket Breakdown for Codex

## Phase 1: Foundation
1. create `shared/` package with types, enums, schemas
2. create `api/` service scaffold
3. create auth middleware and role mapping
4. create error handler and response helpers
5. create `web/` scaffold with routing and app shell

## Phase 2: Core Read Pages
6. implement dashboard endpoint and page
7. implement vendor list endpoint and page
8. implement vendor detail endpoint and page
9. implement run list endpoint and page
10. implement error list endpoint and page

## Phase 3: Analytical Detail
11. implement delta list/detail endpoints and pages
12. implement evidence list/detail endpoints and pages
13. implement report list/detail endpoints and pages
14. implement compare page

## Phase 4: Mutations and Governance
15. implement report approval mutation
16. implement delta review mutation
17. implement vendor activation/deactivation mutation
18. implement audit event persistence
19. implement config validation and config update endpoints

## Phase 5: Administration
20. implement config pages
21. implement audit page
22. implement user admin page
23. implement roles page
24. implement sharepoint diagnostics page

## Phase 6: Hardening
25. add Playwright e2e tests
26. add telemetry/logging correlation IDs
27. add optimistic cache invalidation rules
28. add escalation workflows
29. add export flows

---

## 21. Suggested Codex Prompt Seeds

### Prompt Seed A: Shared Contracts
Create a shared TypeScript package for SCOUT containing enums, interfaces, and Zod schemas for RunSummary, VendorLatestState, EvidenceRecord, DeltaRecord, ReportRecord, AuditEvent, including explicit enums for run status, run mode, freshness, delta type, and report status.

### Prompt Seed B: API Foundation
Create a Fastify TypeScript API under `/api` with route registration, auth middleware placeholder, RBAC middleware, structured error handling, and `/api/v1/dashboard`, `/api/v1/vendors`, `/api/v1/runs` stub routes returning typed DTOs.

### Prompt Seed C: Frontend Shell
Create a React + Vite + TypeScript frontend under `/web` with route structure for `/app/*` and `/admin/*`, including AppShell, SideNav, RoleGuard, placeholder pages, and TanStack Query setup.

### Prompt Seed D: Vendor Pages
Implement vendor list and vendor detail pages using typed API clients, table filtering, loading/error/empty states, and a vendor score panel.

### Prompt Seed E: Config and Audit
Implement config read/update endpoints with Zod validation and audit write hooks, plus an audit list page in the admin area.

---

## 22. Acceptance Criteria

## 22.1 Architectural
- existing CLI processing core remains primary execution engine
- API layer integrates with existing pipeline rather than duplicating it
- frontend consumes typed DTOs only

## 22.2 Security and Governance
- all protected endpoints enforce server-side role checks
- all mutations emit audit records
- guardrails are represented in config limits and cannot be silently bypassed

## 22.3 UX
- all list pages support pagination, sorting, filtering
- all detail pages expose provenance references where applicable
- all mutation actions return success/error states clearly

## 22.4 Operability
- runs can be started and retried from UI
- errors can be inspected and assigned
- SharePoint connection can be validated from admin UI
- dashboard surfaces stale and failed vendors

---

## 23. Recommended Immediate Next Deliverables

1. create `/docs/SCOUT_Technische_Umsetzung_Codex.md`
2. create `/shared` package
3. scaffold `/api`
4. scaffold `/web`
5. implement typed DTOs and initial dashboard/vendors/runs endpoints
6. add role guard framework
7. add audit write service

End of document.
