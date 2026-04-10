# IMPLEMENTATION_PLAN

Version: 0.1
Status: Draft
Target Repository: `TRDiggigo/SCOUT`
Audience: Codex, Engineering, Product, Architecture, Governance

## 1. Purpose

This document defines the implementation sequence for adding a web application layer to SCOUT while preserving the existing CLI-based processing core.

The plan is optimized for:
- Codex execution
- incremental delivery
- auditable progress
- low architectural risk
- clear done criteria

The implementation must preserve the current SCOUT processing responsibilities:
- A1 research
- A2 structured extraction
- A3 scoring
- A4 delta detection
- A5 reporting
- A6 SharePoint persistence

The implementation must add:
- typed shared contracts
- application API
- web frontend
- auth and RBAC
- audit-capable mutations
- optional read model for UI performance

---

## 2. Implementation Principles

1. Do not rewrite the existing CLI pipeline.
2. Add API and UI as a new layer above the processing core.
3. Keep all mutations auditable.
4. Keep all scores traceable to runs and evidence.
5. Implement typed contracts before feature pages.
6. Build read paths before mutation paths.
7. Deliver usable vertical slices as early as possible.
8. Prefer thin routes, explicit services, typed DTOs, and Zod validation.

---

## 3. Delivery Phases

| Phase | Name | Objective |
|---|---|---|
| 0 | Foundation Alignment | establish contracts, repo structure, implementation rules |
| 1 | API + UI Skeleton | create backend/frontend scaffolding and auth skeleton |
| 2 | Core Read Views | deliver dashboard, vendors, runs, errors |
| 3 | Analytical Detail | deliver deltas, evidence, reports, compare view |
| 4 | Controlled Mutations | deliver approvals, review actions, run control, config validation |
| 5 | Administration & Governance | deliver config pages, audit, user/role views, SharePoint diagnostics |
| 6 | Hardening | test, stabilize, instrument, document, prepare rollout |

---

## 4. Work Package Structure

Each work package must contain:
- objective
- dependencies
- implementation tasks
- deliverables
- done criteria
- test expectations

Codex should complete work packages in order unless a package explicitly states that parallel work is safe.

---

# PHASE 0 — FOUNDATION ALIGNMENT

## WP-00.1 Create shared domain contract package

### Objective
Create a shared package for enums, interfaces, DTOs, and Zod schemas used by both API and frontend.

### Dependencies
None.

### Tasks
- create `/shared`
- add `package.json`
- add `src/enums.ts`
- add `src/types.ts`
- add `src/schemas.ts`
- add `src/index.ts`
- define domain types for RunSummary, VendorLatestState, EvidenceRecord, DeltaRecord, ReportRecord, AuditEvent
- define explicit enums for all status/type fields
- define Zod schemas for list items and mutation payloads

### Deliverables
- `shared/package.json`
- `shared/src/enums.ts`
- `shared/src/types.ts`
- `shared/src/schemas.ts`
- `shared/src/index.ts`

### Done Criteria
- package builds successfully
- enums and types cover the current implementation scope
- Zod schemas exist for core list DTOs and initial mutations
- API and web packages can import shared contracts

### Tests
- unit tests for schema validation
- one positive and one negative test per core schema

---

## WP-00.2 Create implementation conventions

### Objective
Define coding conventions for API and frontend to keep Codex output consistent.

### Dependencies
WP-00.1

### Tasks
- create `docs/CONVENTIONS.md`
- specify naming rules for routes, services, DTOs, React components, query keys
- specify error response shape
- specify audit requirements for mutations
- specify RBAC enforcement rule: server-side only counts as authoritative

### Deliverables
- `docs/CONVENTIONS.md`

### Done Criteria
- conventions exist and are specific enough for Codex to follow
- route/service/component naming is unambiguous
- audit and RBAC rules are explicitly written

### Tests
- no runtime tests required
- document completeness review

---

# PHASE 1 — API + UI SKELETON

## WP-01.1 Scaffold API service

### Objective
Create a TypeScript API service with route registration, middleware structure, and health boot path.

### Dependencies
WP-00.1

### Tasks
- create `/api`
- add TypeScript config
- add Fastify setup
- create `server.ts` and `app.ts`
- register versioned route groups under `/api/v1`
- add health endpoint
- add structured error handler
- add request correlation id support

### Deliverables
- `api/package.json`
- `api/tsconfig.json`
- `api/src/server.ts`
- `api/src/app.ts`
- `api/src/middleware/error-handler.ts`
- `api/src/util/response.ts`
- `api/src/util/logger.ts`

### Done Criteria
- API starts locally
- `/api/v1/health` returns 200
- global error handler returns standardized error envelope
- correlation id is included in error responses

### Tests
- server boot test
- health route test
- error normalization test

---

## WP-01.2 Scaffold frontend application

### Objective
Create a React + Vite + TypeScript frontend with route shell and protected navigation sections.

### Dependencies
WP-00.1

### Tasks
- create `/web`
- add Vite + React + TypeScript
- add router
- add app shell
- add placeholder routes for `/app/*` and `/admin/*`
- add placeholder shared layout components
- add TanStack Query provider

### Deliverables
- `web/package.json`
- `web/vite.config.ts`
- `web/src/main.tsx`
- `web/src/app/router.tsx`
- `web/src/app/AppShell.tsx`
- `web/src/components/*`

### Done Criteria
- frontend starts locally
- placeholder pages render
- route shell differentiates app and admin areas
- shared query provider is active

### Tests
- render smoke test
- router test for main routes

---

## WP-01.3 Add authentication and role skeleton

### Objective
Add the auth structure required for later protection, without yet requiring full production identity hardening.

### Dependencies
WP-01.1, WP-01.2

### Tasks
- create backend auth middleware placeholder
- add token extraction and request user context shape
- add frontend auth provider abstraction
- add role guard component on frontend
- add server-side `requireRoles(...)` middleware
- define internal roles

### Deliverables
- `api/src/auth/entra-jwt.ts`
- `api/src/auth/role-mapper.ts`
- `api/src/middleware/auth.ts`
- `api/src/middleware/role-guard.ts`
- `web/src/auth/*`
- `web/src/app/guards/RoleGuard.tsx`

### Done Criteria
- API can protect routes with placeholder auth strategy
- frontend can hide/show routes based on mocked roles
- internal role constants are shared and stable

### Tests
- unauthorized request test
- forbidden request test
- frontend route guard test

---

# PHASE 2 — CORE READ VIEWS

## WP-02.1 Implement dashboard vertical slice

### Objective
Deliver the first complete vertical slice from backend data to visible UI.

### Dependencies
WP-01.1, WP-01.2, WP-01.3

### Tasks
- implement dashboard DTO
- implement dashboard service
- implement dashboard route
- implement dashboard page
- render latest run, active vendor count, stale vendors, failed vendors, open escalations, average scores, budget summary

### Deliverables
- `api/src/routes/dashboard.routes.ts`
- `api/src/services/dashboard.service.ts`
- `web/src/pages/dashboard/*`

### Done Criteria
- dashboard page loads from live API endpoint
- API response is typed and validated
- loading, empty, and error states exist
- stale/failed vendor indicators are visible

### Tests
- dashboard service test
- dashboard route test
- dashboard page rendering test

---

## WP-02.2 Implement vendor list vertical slice

### Objective
Deliver vendor list with filtering and sorting.

### Dependencies
WP-02.1

### Tasks
- implement vendor list DTOs
- implement vendor repository/service
- implement `GET /api/v1/vendors`
- implement vendor list page with table, filter bar, score badges, freshness badges
- support pagination and sort

### Deliverables
- `api/src/routes/vendors.routes.ts`
- `api/src/services/vendor.service.ts`
- `web/src/pages/vendors/VendorListPage.tsx`
- `web/src/pages/vendors/components/*`

### Done Criteria
- vendor list loads from API
- sorting works for name, overall score, confidence, freshness, date
- filtering works for category, tracking status, freshness status, escalation
- empty and error states render correctly

### Tests
- vendor list route test
- vendor filtering/sorting test
- frontend interaction test

---

## WP-02.3 Implement vendor detail vertical slice

### Objective
Deliver vendor detail page with master data, scoring, governance, provenance sections.

### Dependencies
WP-02.2

### Tasks
- implement vendor detail DTO
- implement `GET /api/v1/vendors/:vendorId`
- implement detail sections and page layout
- show evidence count, latest run id, source run id, confidence, score divergence

### Deliverables
- vendor detail route/service extension
- `web/src/pages/vendors/VendorDetailPage.tsx`

### Done Criteria
- vendor detail page opens from vendor list
- page shows at least master data, scoring, freshness, governance, relations sections
- provenance-related fields are visible

### Tests
- vendor detail route test
- vendor detail page test

---

## WP-02.4 Implement runs list vertical slice

### Objective
Deliver operational run list.

### Dependencies
WP-02.1

### Tasks
- implement run summary DTO
- implement `GET /api/v1/runs`
- implement runs page with table and filters
- display status, mode, total vendors, failed vendors, budget use, manifest reference

### Deliverables
- `api/src/routes/runs.routes.ts`
- `api/src/services/run.service.ts`
- `web/src/pages/runs/RunListPage.tsx`

### Done Criteria
- run list loads and filters by status/mode/date
- run table supports pagination and sorting
- route is protected for operator/admin/governance roles

### Tests
- run route authorization test
- run list page rendering test

---

## WP-02.5 Implement error list vertical slice

### Objective
Deliver a first operational error overview.

### Dependencies
WP-02.4

### Tasks
- implement error DTO
- implement `GET /api/v1/errors`
- implement error list page
- display stage, error type, severity, retry status, resolution status, assignee

### Deliverables
- `api/src/routes/errors.routes.ts`
- `api/src/services/error.service.ts`
- `web/src/pages/errors/ErrorListPage.tsx`

### Done Criteria
- error list loads and is role-protected
- list supports filtering by severity, stage, resolution status
- error rows link to related run where available

### Tests
- error route test
- frontend filter test

---

# PHASE 3 — ANALYTICAL DETAIL

## WP-03.1 Implement delta list and detail

### Objective
Expose snapshot changes for analyst workflow.

### Dependencies
WP-02.2, WP-02.3

### Tasks
- implement delta DTOs
- implement `GET /api/v1/deltas`
- implement `GET /api/v1/deltas/:deltaId`
- implement delta list page and detail page
- show change type, impacted dimension, old/new values, severity, confidence, review status

### Deliverables
- `api/src/routes/deltas.routes.ts`
- `api/src/services/delta.service.ts`
- `web/src/pages/deltas/*`

### Done Criteria
- analysts can browse deltas
- delta detail shows linked evidence refs if available
- review status is visible even before mutation support is added

### Tests
- delta list/detail route tests
- delta page rendering tests

---

## WP-03.2 Implement evidence list and detail

### Objective
Expose evidence-level traceability for vendor claims.

### Dependencies
WP-02.3

### Tasks
- implement evidence DTOs
- implement `GET /api/v1/evidence`
- implement `GET /api/v1/evidence/:evidenceId`
- implement evidence list/detail pages
- show raw excerpt, source url, source type, claim type, extraction confidence, run id

### Deliverables
- `api/src/routes/evidence.routes.ts`
- `api/src/services/evidence.service.ts`
- `web/src/pages/evidence/*`

### Done Criteria
- evidence list can filter by vendor and claim type
- evidence detail shows raw excerpt and provenance-related data
- source url is clickable

### Tests
- evidence route tests
- evidence page tests

---

## WP-03.3 Implement reports list and detail

### Objective
Expose daily reports and weekly digests.

### Dependencies
WP-02.1

### Tasks
- implement report DTOs
- implement `GET /api/v1/reports`
- implement `GET /api/v1/reports/:reportId`
- implement report list and detail pages
- render summary, key movements, governance alerts, linked references

### Deliverables
- `api/src/routes/reports.routes.ts`
- `api/src/services/report.service.ts`
- `web/src/pages/reports/*`

### Done Criteria
- report list loads
- report detail renders core sections
- reports show status, version, reporting period, source run

### Tests
- report route tests
- report page rendering tests

---

## WP-03.4 Implement compare view

### Objective
Enable side-by-side vendor comparison.

### Dependencies
WP-02.2, WP-02.3

### Tasks
- implement compare DTO if needed
- implement `POST /api/v1/vendors/compare`
- implement compare selection UI from vendor list/detail
- render compare table for 2 to 5 vendors

### Deliverables
- compare route/service extension
- `web/src/pages/vendors/VendorComparePage.tsx`

### Done Criteria
- user can add/remove vendors to compare
- compare page renders defined comparison columns
- invalid compare selection is handled gracefully

### Tests
- compare endpoint test
- compare page interaction test

---

# PHASE 4 — CONTROLLED MUTATIONS

## WP-04.1 Implement audit write infrastructure

### Objective
Ensure every mutation can be recorded reliably.

### Dependencies
WP-01.1, WP-01.3

### Tasks
- implement audit repository and service
- define audit write request type
- add audit helper for mutation services
- enforce mutation fails if required audit write fails

### Deliverables
- `api/src/services/audit.service.ts`
- `api/src/repositories/audit.repository.ts`
- `api/src/middleware/audit-write.ts`

### Done Criteria
- mutation-capable services can write audit events
- audit payload contains actor, action, target, before state, after state, reason where applicable

### Tests
- audit write success test
- audit failure behavior test

---

## WP-04.2 Implement report approval mutation

### Objective
Allow report approval by permitted roles.

### Dependencies
WP-03.3, WP-04.1

### Tasks
- implement `POST /api/v1/reports/:reportId/approve`
- require lead analyst/admin/governance owner role
- validate payload
- write audit event
- invalidate report query cache in frontend
- add approval UI action

### Deliverables
- report approval endpoint
- report approval button/dialog

### Done Criteria
- only permitted roles can approve
- approval updates report state
- audit event is written
- UI reflects new state without reload issues

### Tests
- approval authorization test
- approval mutation test
- frontend mutation flow test

---

## WP-04.3 Implement delta review mutation

### Objective
Allow analysts to update delta review status.

### Dependencies
WP-03.1, WP-04.1

### Tasks
- implement `POST /api/v1/deltas/:deltaId/review-status`
- validate review status transition
- add comment option
- write audit event
- update frontend detail and list views

### Deliverables
- delta review status endpoint
- delta review UI controls

### Done Criteria
- analysts can move delta into review statuses allowed by role
- final approval/rejection can be limited to higher roles if desired
- audit entry is created

### Tests
- review status validation test
- authorization test
- frontend mutation test

---

## WP-04.4 Implement run start and retry-failed mutations

### Objective
Expose safe operational run control in the UI.

### Dependencies
WP-02.4, WP-04.1

### Tasks
- implement `POST /api/v1/runs`
- implement `POST /api/v1/runs/:runId/retry-failed`
- bridge to existing pipeline via adapter
- write audit events
- expose UI buttons in admin run pages

### Deliverables
- run mutation endpoints
- pipeline adapter run orchestration
- frontend controls for start and retry

### Done Criteria
- operator/admin can start run
- retry-failed action exists and is role-protected
- mutation response returns stable run status payload
- no pipeline logic is duplicated in API layer

### Tests
- run start auth test
- run start adapter invocation test
- retry-failed test

---

## WP-04.5 Implement config validation endpoint

### Objective
Validate managed configuration before update or before execution.

### Dependencies
WP-00.1, WP-04.1

### Tasks
- implement `POST /api/v1/config/validate`
- validate vendors, weights, sources, providers, limits schemas
- return explicit error list
- surface validation in frontend config area

### Deliverables
- config validation endpoint
- frontend config validation action

### Done Criteria
- endpoint returns `valid=true/false`
- validation errors include path and message
- config pages can invoke validation visibly

### Tests
- config validation positive/negative tests
- frontend validation action test

---

# PHASE 5 — ADMINISTRATION & GOVERNANCE

## WP-05.1 Implement configuration pages

### Objective
Create read/write admin pages for vendors, weights, sources, providers, and limits.

### Dependencies
WP-04.5

### Tasks
- implement config read endpoints if not already present
- implement config update endpoints
- build pages for `/admin/config/vendors`, `/weights`, `/sources`, `/providers`, `/limits`
- apply admin-only mutation guards
- apply audit write on each update

### Deliverables
- config routes/services
- config pages and forms

### Done Criteria
- admin can load and edit configuration areas
- validation runs before save
- every save creates audit record
- limits page clearly surfaces guardrails

### Tests
- config route tests
- save validation test
- frontend config form tests

---

## WP-05.2 Implement audit page

### Objective
Expose auditable history to governance roles.

### Dependencies
WP-04.1

### Tasks
- implement `GET /api/v1/audit`
- add audit filters for target type, action type, actor, date range
- render audit list page
- allow drilldown to related run/report/target where possible

### Deliverables
- audit endpoint
- `web/src/pages/audit/AuditListPage.tsx`

### Done Criteria
- admin and governance owner can browse audit events
- filters work
- linked objects are navigable where references exist

### Tests
- audit auth test
- audit list filter test

---

## WP-05.3 Implement user and role views

### Objective
Provide admin visibility into users and role assignments.

### Dependencies
WP-01.3

### Tasks
- implement `GET /api/v1/admin/users`
- implement `PUT /api/v1/admin/users/:userId`
- implement `GET /api/v1/admin/roles`
- build users and roles pages
- keep role mutation simple and auditable

### Deliverables
- admin user routes/services
- `web/src/pages/admin/*`

### Done Criteria
- admin can view users and roles
- admin can change role assignments if enabled
- every change is audited

### Tests
- admin auth tests
- user update test
- frontend role assignment flow test

---

## WP-05.4 Implement SharePoint diagnostics page

### Objective
Provide admin visibility into repository-backed storage connectivity.

### Dependencies
WP-01.1

### Tasks
- implement `GET /api/v1/admin/sharepoint`
- implement `POST /api/v1/admin/sharepoint/validate`
- create diagnostic panel with site url, key paths, connection status, last validation

### Deliverables
- sharepoint admin route/service
- sharepoint diagnostics page

### Done Criteria
- admin can see configured site and paths
- validate action executes and returns result clearly
- failure states are rendered clearly

### Tests
- diagnostics route tests
- frontend validate action test

---

# PHASE 6 — HARDENING

## WP-06.1 Add read model support

### Objective
Improve performance and simplify complex dashboard/list queries.

### Dependencies
WP-02.1 through WP-05.4

### Tasks
- implement read-model adapter
- define read-model storage tables or collections
- ingest latest snapshot after successful promotion to `latest/`
- update services to prefer read-model queries where appropriate

### Deliverables
- `api/src/adapters/read-model.adapter.ts`
- read model schema/migrations

### Done Criteria
- dashboard and key tables can read from read model
- refresh strategy after successful run is defined and implemented
- fallback behavior exists if read model is stale or unavailable

### Tests
- read-model ingest test
- fallback test

---

## WP-06.2 Add end-to-end tests

### Objective
Validate critical user journeys.

### Dependencies
WP-06.1

### Tasks
- add Playwright
- script login stub or test auth mode
- implement journeys for dashboard, vendor detail, delta review, report approval, run control, config validation

### Deliverables
- `web/tests/e2e/*`

### Done Criteria
- critical journeys run in CI or documented local flow
- failures provide actionable output

### Tests
- the e2e suite itself is the test deliverable

---

## WP-06.3 Add observability and operational polish

### Objective
Make the system diagnosable and rollout-ready.

### Dependencies
WP-06.1

### Tasks
- add structured request logs
- add mutation audit correlation with request id
- add frontend error boundary strategy
- add clear empty/loading/error states on all pages
- add operator notes where useful

### Deliverables
- logging improvements
- error boundary components
- standardized status components

### Done Criteria
- all major routes emit structured logs
- all pages have consistent state handling
- request correlation id can be traced across layers where possible

### Tests
- log shape test where practical
- UI state tests

---

## WP-06.4 Final documentation and rollout note

### Objective
Prepare the implementation for handover and controlled rollout.

### Dependencies
All earlier work packages

### Tasks
- update README with new architecture sections
- add local dev instructions for API and web
- add environment variable documentation
- add role model summary
- add release checklist

### Deliverables
- updated `README.md`
- `docs/ROLL_OUT_CHECKLIST.md`

### Done Criteria
- a new engineer can start API and web locally using docs only
- rollout checklist exists and references guardrails

### Tests
- doc walkthrough review

---

## 5. First 10 Priority Tasks for Codex

1. create `/shared` package with enums, types, schemas
2. create `/api` Fastify TypeScript scaffold
3. create `/web` React Vite TypeScript scaffold
4. add backend auth placeholder and RBAC middleware
5. add frontend route shell and role guard
6. implement dashboard backend + page
7. implement vendor list backend + page
8. implement vendor detail backend + page
9. implement runs list backend + page
10. implement errors list backend + page

These ten tasks are the minimum sequence required to produce a visible and useful system skeleton.

---

## 6. Definition of Done — Global

A work package is only done if:
- code compiles
- tests for the work package pass
- route/page is wired into the application
- loading/error/empty states exist where applicable
- RBAC is enforced server-side for protected actions
- audit is written for all mutations
- naming follows conventions
- DTOs and schemas are explicit and typed

---

## 7. Risk Controls

| Risk | Control |
|---|---|
| accidental pipeline rewrite | enforce adapter-based integration only |
| weak typing between layers | shared contracts package |
| mutation without traceability | mandatory audit writes |
| frontend exposing unauthorized actions | server-side RBAC as authority |
| slow dashboard queries | introduce read model in hardening phase |
| config drift | validation endpoint plus audited config saves |

---

## 8. Stop Conditions

Codex should stop and request human review if:
- existing pipeline contracts are unclear enough that adapter integration would be speculative
- SharePoint persistence structures are incompatible with assumed read patterns
- auth requirements conflict with the selected deployment model
- required mutation semantics are ambiguous for governance-sensitive actions

---

## 9. Recommended Immediate Execution Order

Immediate execution order:
- WP-00.1
- WP-00.2
- WP-01.1
- WP-01.2
- WP-01.3
- WP-02.1
- WP-02.2
- WP-02.3
- WP-02.4
- WP-02.5

This sequence creates the earliest useful system slice with minimal architectural risk.

End of document.
