# CONVENTIONS

Version: 0.1
Status: Draft
Target Repository: `TRDiggigo/SCOUT`
Audience: Engineering, Codex, Architecture, Product, Governance

## 1. Purpose

This document defines binding implementation conventions for SCOUT.

These conventions apply to all new work related to:
- `/shared`
- `/api`
- `/web`

These conventions are subordinate to the architectural guardrails already defined in:
- `IMPLEMENTATION_PLAN.md`
- `docs/SCOUT_UI_Fachkonzept_Codex.md`
- `docs/SCOUT_Technische_Umsetzung_Codex.md`

If implementation choices conflict with those documents, those documents take precedence over ad hoc coding decisions.

---

## 2. Global Rules

1. Do not rewrite the existing CLI/pipeline core.
2. Add API and UI only as a new layer above the existing processing core.
3. Use explicit types, explicit DTOs, and explicit validation.
4. Prefer additive changes over destructive refactoring.
5. Prefer small, reviewable commits.
6. Avoid speculative abstractions.
7. All protected behavior must be enforced server-side.
8. All mutations must be auditable.
9. Frontend may improve usability, but must not become the source of truth for security or business control.
10. Keep naming stable and machine-readable.

---

## 3. Repository and Folder Structure Rules

## 3.1 `/shared`
Purpose:
- shared enums
- shared types
- shared DTO contracts
- shared Zod schemas

Rules:
- only cross-layer contracts belong here
- no runtime business logic
- no framework-specific React or Fastify code
- no storage adapters
- no side effects at import time

## 3.2 `/api`
Purpose:
- application API
- auth and RBAC
- orchestration services
- repositories and adapters
- mutation handling
- audit integration

Rules:
- routes are thin
- services contain orchestration and business rules
- repositories handle storage access
- adapters bridge to existing pipeline or external systems
- routes must not contain storage or domain logic

## 3.3 `/web`
Purpose:
- analyst workspace
- admin/operations console
- route shell
- page rendering
- API consumption

Rules:
- pages are feature-oriented
- shared UI components belong in shared component folders
- data fetching is separated from presentational components
- frontend must consume API DTOs, not storage payloads

---

## 4. Naming Conventions

## 4.1 General Naming Rules

Use:
- descriptive names
- singular names for single objects
- plural names for collections
- stable names across layers

Avoid:
- vague names like `helper`, `misc`, `data2`, `temp`
- inconsistent abbreviations
- ambiguous acronyms unless domain-standard

## 4.2 File Naming

### TypeScript files
Use kebab-case or domain-specific dotted suffixes consistently.

Examples:
- `dashboard.routes.ts`
- `vendor.service.ts`
- `audit.repository.ts`
- `pipeline.adapter.ts`
- `error-handler.ts`

### React component files
Use PascalCase for component file names.

Examples:
- `VendorListPage.tsx`
- `RunDetailPanel.tsx`
- `RoleGuard.tsx`

### Documentation files
Use uppercase stable names when the file is a canonical project document.

Examples:
- `IMPLEMENTATION_PLAN.md`
- `CONVENTIONS.md`

---

## 5. Naming Rules by Layer

## 5.1 Routes

Pattern:
- `<domain>.routes.ts`

Examples:
- `dashboard.routes.ts`
- `vendors.routes.ts`
- `runs.routes.ts`

Rules:
- route registration file names are plural if the route group is plural in the API
- route handlers expose HTTP behavior only
- no direct repository access from routes

## 5.2 Services

Pattern:
- `<domain>.service.ts`

Examples:
- `dashboard.service.ts`
- `vendor.service.ts`
- `config.service.ts`

Rules:
- services contain orchestration and domain rules
- service methods should be explicit and verb-based
- avoid generic method names like `handle()` or `process()` unless domain-qualified

Preferred method names:
- `getDashboardSummary`
- `listVendors`
- `getVendorById`
- `approveReport`
- `retryFailedVendors`

## 5.3 Repositories

Pattern:
- `<domain>.repository.ts`

Examples:
- `runs.repository.ts`
- `audit.repository.ts`
- `config.repository.ts`

Rules:
- repositories encapsulate storage access
- repository method names should reflect persistence intent
- repositories must not enforce cross-domain business policy

Preferred method names:
- `findLatestRun`
- `listRunSummaries`
- `saveAuditEvent`
- `loadConfigWeights`
- `updateVendorConfig`

## 5.4 Adapters

Pattern:
- `<target>.adapter.ts`

Examples:
- `pipeline.adapter.ts`
- `sharepoint.adapter.ts`
- `read-model.adapter.ts`

Rules:
- adapters bridge one boundary
- adapter names must reflect the system boundary they represent
- do not hide orchestration in adapters

## 5.5 DTOs

Pattern:
- `<Domain><Purpose>Dto`
- use suffix `Dto` explicitly

Examples:
- `VendorListItemDto`
- `VendorDetailDto`
- `DashboardResponseDto`
- `RunSummaryDto`

Rules:
- DTOs define API-facing data contracts
- DTOs must be explicit
- do not reuse raw repository payloads as DTOs
- DTO names must distinguish list item vs detail vs mutation response

## 5.6 Zod Schemas

Pattern:
- `<name>Schema`

Examples:
- `runSummarySchema`
- `vendorLatestStateSchema`
- `reportApproveRequestSchema`

Rules:
- all request validation schemas end in `Schema`
- schema names must match the corresponding type or payload intent
- mutation payload schemas must be explicit

## 5.7 Shared Types and Enums

Pattern:
- types: PascalCase
- enums represented as constant arrays: UPPER_SNAKE_CASE
- derived union types: PascalCase

Examples:
- `RUN_STATUS`
- `RunStatus`
- `VendorLatestState`
- `AuditEvent`

Rules:
- enum values must be explicit strings
- values must be stable over time unless intentionally versioned

## 5.8 React Components

Pattern:
- PascalCase

Examples:
- `AppShell`
- `VendorListTable`
- `EvidenceDetailPanel`
- `RoleGuard`

Rules:
- page components end with `Page`
- reusable presentational blocks may end with `Panel`, `Table`, `Card`, `Header`, `Dialog`, `Badge`
- hooks use the `use` prefix

Examples:
- `VendorListPage`
- `RunStatusHeader`
- `ConfirmDialog`
- `useVendorFilters`

## 5.9 Page Components

Pattern:
- `<Domain><PagePurpose>Page`

Examples:
- `DashboardPage`
- `VendorListPage`
- `VendorDetailPage`
- `RunListPage`
- `AuditListPage`

Rules:
- page names must align with route purpose
- avoid multiple unrelated concerns in one page component

## 5.10 Query Keys

Pattern:
- array-based keys
- first element is stable domain token
- next elements refine by scope/filters/id

Examples:
- `['dashboard']`
- `['vendors', filters]`
- `['vendor', vendorId]`
- `['runs', filters]`
- `['report', reportId]`

Rules:
- query keys must be deterministic
- do not embed unstable objects without normalization
- singular object detail key uses singular domain term
- collection key uses plural domain term

---

## 6. API Error Response Convention

All API errors must follow a single normalized shape.

Required shape:

```json
{
  "error": {
    "code": "string_code",
    "message": "Human-readable message",
    "details": {},
    "correlationId": "request-correlation-id"
  }
}
```

Rules:
- `code` is required
- `message` is required
- `details` is optional but recommended for validation failures
- `correlationId` is required for operational traceability
- raw internal stack traces must not be exposed to API consumers

Preferred error codes:
- `validation_error`
- `auth_error`
- `forbidden_error`
- `not_found`
- `conflict`
- `provider_error`
- `pipeline_error`
- `sharepoint_error`
- `read_model_error`
- `internal_error`

---

## 7. Audit Convention

## 7.1 Mandatory Rule
Every mutation must be auditable.

No server-side mutation is complete unless an audit record is written or the mutation is explicitly designed as non-audited by policy.

For SCOUT, default assumption is:
- mutation without audit is not allowed

## 7.2 Mutations Requiring Audit
This includes at least:
- config changes
- report approval
- delta review updates
- run start
- retry-failed actions
- vendor activation/deactivation
- role changes
- threshold changes
- source disablement

## 7.3 Audit Payload Expectations
Audit events should capture at least:
- actor id
- actor type
- action type
- target type
- target id
- timestamp
- before state where applicable
- after state where applicable
- reason where applicable
- related run/report identifiers where applicable

## 7.4 Enforcement Rule
Audit write is not a frontend concern.
Audit write must be enforced in backend mutation flow.

---

## 8. RBAC Convention

## 8.1 Mandatory Rule
Server-side RBAC enforcement is authoritative.

Frontend route guards, hidden buttons, disabled controls, and role-based rendering are UX measures only.
They do not count as security controls.

## 8.2 Consequences
- every protected endpoint must verify the user and roles server-side
- frontend may hide actions that are not allowed, but backend must reject unauthorized calls regardless
- route-level backend protection is required even if frontend already restricts the page

## 8.3 Role Naming
Internal roles must remain stable and explicit.

Use:
- `ROLE_VIEWER`
- `ROLE_ANALYST`
- `ROLE_LEAD_ANALYST`
- `ROLE_OPERATOR`
- `ROLE_ADMIN`
- `ROLE_GOVERNANCE_OWNER`

---

## 9. Thin Routes Rule

Routes must be thin.

Routes may:
- validate request shape
- attach auth and role guards
- call services
- shape HTTP response
- translate errors to HTTP responses

Routes must not:
- contain business rules
- call storage directly for domain operations
- implement orchestration
- write audit events directly except through approved service path

---

## 10. Explicit Services Rule

Services are the main home for orchestration and domain behavior.

Services should:
- contain use-case logic
- coordinate repositories and adapters
- apply business rules
- trigger audit writes for mutations
- normalize operational failures

Services should not:
- render UI concerns
- expose raw storage formats unnecessarily
- become a dump for unrelated helper functions

---

## 11. Typed DTO Rule

All API responses and mutation payloads must use explicit DTOs.

Rules:
- do not expose raw SharePoint payloads directly
- do not expose raw pipeline artifact structures directly unless intentionally modeled as DTOs
- define separate DTOs for list items, detail views, and mutation responses where needed
- DTOs must align with shared contracts where possible

---

## 12. Validation with Zod

Use Zod for explicit validation of:
- request payloads
- route params where modeled
- config payloads
- DTO shaping where appropriate
- shared contract schemas

Rules:
- schema names end in `Schema`
- mutation schemas must be explicit
- validation must happen before service mutation logic runs
- validation failures must return normalized error responses

---

## 13. Frontend State Rendering Convention

Every data-driven page must explicitly handle:
- loading state
- error state
- empty state
- success state

Rules:
- never assume data is instantly available
- never render blank areas silently for missing data
- empty state must tell the user why the list is empty when possible
- error state must be visible and actionable where possible

Preferred shared components:
- `LoadingState`
- `ErrorState`
- `EmptyState`

---

## 14. Frontend Data Access Convention

Rules:
- frontend consumes API DTOs only
- API access should be centralized in feature-specific API modules or shared client modules
- query keys must be stable and deterministic
- data-fetching hooks should be named from the domain intent

Examples:
- `useDashboardQuery`
- `useVendorListQuery`
- `useVendorDetailQuery`
- `useApproveReportMutation`

---

## 15. Testing Convention

## 15.1 Shared Package
- schema tests must include positive and negative cases

## 15.2 API
- route tests for status and validation
- auth and RBAC tests for protected endpoints
- service tests for mutation and orchestration logic

## 15.3 Frontend
- render tests for core pages
- loading/error/empty state tests
- interaction tests for filters and mutations where relevant

## 15.4 E2E
- cover critical journeys only
- prefer stable, role-aware, non-fragile flows

---

## 16. Non-Allowed Shortcuts

The following are not acceptable:
- bypassing backend RBAC because the frontend hides controls
- mutating config without audit
- using untyped `any`-based DTO boundaries without reason
- embedding business rules inside route handlers
- exposing internal storage objects directly as API contracts
- creating speculative folders or abstractions unrelated to current work package

---

## 17. Practical Default Decisions

Until explicitly changed by architecture decision:
- backend routes use `<domain>.routes.ts`
- services use `<domain>.service.ts`
- repositories use `<domain>.repository.ts`
- adapters use `<target>.adapter.ts`
- page components use PascalCase and end in `Page`
- DTOs use PascalCase and suffix `Dto`
- Zod schemas use camelCase and suffix `Schema`
- query keys are array-based
- protected behavior is enforced server-side
- mutation flows require audit

---

## 18. Definition of Usefulness

This document is only useful if Codex can use it to implement:
- WP-01.1 API scaffold
- WP-01.2 frontend scaffold
- later route/service/component additions

without inventing naming or enforcement rules ad hoc.

End of document.
