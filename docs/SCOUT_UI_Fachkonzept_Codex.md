# SCOUT UI Functional Specification
Version: 0.1  
Status: Draft  
Target Repository: `TRDiggigo/SCOUT`  
Audience: Product, Engineering, Codex, Architecture, Governance

## 1. Purpose

This document defines the target UI specification for SCOUT.

SCOUT currently exposes a CLI-oriented processing core with the following observable capabilities:

- pipeline stages A1 to A6
- evidence extraction into `evidence.json`
- scoring into `scores.json`
- delta detection against prior `latest/`
- markdown report and weekly digest generation
- SharePoint persistence
- run idempotency and provenance tracking

This specification defines a web-based UI layer that sits on top of the existing processing core without changing its architectural role.

The UI is divided into two major areas:

1. Analyst Workspace
2. Admin / Operations Console

The specification is intentionally structured for direct use by Codex and implementation agents.

---

## 2. Design Principles

### 2.1 Architectural Principles

- The existing CLI/pipeline remains the processing core.
- The UI must consume a dedicated application API.
- The UI must not bypass provenance, run metadata, evidence chains, or guardrails.
- All displayed scores must be traceable to evidence and source runs.
- All configuration changes must be auditable.
- All governance-relevant actions must be attributable to a role and actor.

### 2.2 Modeling Principles

The UI must be modeled around the following core objects:

- Run
- Vendor
- Evidence
- Score
- Delta
- Report
- Configuration
- Audit Event
- Escalation Event
- User
- Role

### 2.3 Codex Consumption Principles

To maximize machine implementation quality:

- use stable object names
- use stable page identifiers
- use stable field identifiers
- define enum values explicitly
- define role permissions explicitly
- define API routes explicitly
- separate read models from mutation actions

---

## 3. Target Application Structure

## 3.1 Logical Areas

### AREA_A: Analyst Workspace
Purpose:
- read and interpret market results
- compare vendors
- inspect evidence
- analyze changes
- review reports

### AREA_B: Admin / Operations Console
Purpose:
- operate runs
- resolve failures
- maintain configuration
- inspect audit trails
- manage users and roles
- enforce governance controls

---

## 4. Roles

## 4.1 Role Definitions

### ROLE_VIEWER
Purpose:
- read-only consumer

Permissions:
- view dashboard
- view vendors
- view deltas
- view reports
- view evidence

No permissions for:
- run control
- config changes
- approvals
- user management

### ROLE_ANALYST
Purpose:
- analytical review and interpretation

Permissions:
- all ROLE_VIEWER permissions
- add comments
- mark items for review
- compare vendors
- set evidence review flags

No permissions for:
- config changes
- technical run control
- user management

### ROLE_LEAD_ANALYST
Purpose:
- analytical lead and release reviewer

Permissions:
- all ROLE_ANALYST permissions
- approve reports
- propose overrides
- finalize delta review
- escalate analytical findings

No permissions for:
- technical platform administration
- auth/security administration

### ROLE_OPERATOR
Purpose:
- operational run management

Permissions:
- view all operational pages
- start runs
- retry failed vendors
- inspect logs and failures
- validate configuration

No permissions for:
- user/role administration
- governance policy ownership unless separately assigned

### ROLE_ADMIN
Purpose:
- technical and platform administration

Permissions:
- all ROLE_OPERATOR permissions
- edit configuration
- manage system settings
- manage users and roles
- manage SharePoint connection targets
- manage thresholds and providers

### ROLE_GOVERNANCE_OWNER
Purpose:
- control, audit, compliance, and policy release

Permissions:
- read audit views
- approve governance-relevant changes
- approve rubric changes
- approve exception handling
- inspect evidence traceability
- inspect escalations

---

## 5. Navigation Model

## 5.1 Global Navigation

Top-level navigation IDs:

- NAV_DASHBOARD
- NAV_VENDORS
- NAV_DELTAS
- NAV_REPORTS
- NAV_EVIDENCE
- NAV_RUNS
- NAV_ERRORS
- NAV_CONFIGURATION
- NAV_AUDIT
- NAV_ADMINISTRATION

## 5.2 Navigation Visibility by Role

| Navigation | Viewer | Analyst | Lead Analyst | Operator | Admin | Governance Owner |
|---|---:|---:|---:|---:|---:|---:|
| Dashboard | X | X | X | X | X | X |
| Vendors | X | X | X | X | X | X |
| Deltas | X | X | X | X | X | X |
| Reports | X | X | X | X | X | X |
| Evidence | X | X | X | X | X | X |
| Runs |  |  |  | X | X | X |
| Errors |  |  |  | X | X | X |
| Configuration |  |  |  | X | X | X |
| Audit |  |  | partial |  | X | X |
| Administration |  |  |  |  | X |  |

---

## 6. Page Specification

# 6.1 PAGE_DASHBOARD

Page ID: `PAGE_DASHBOARD`  
Area: Shared  
Primary Roles: all roles

### Purpose
Provide a condensed operational and analytical overview of the current system state.

### Primary Widgets
- latest successful run
- active run
- total active vendors
- changed vendors today
- stale vendors
- failed vendors
- open escalations
- average score by dimension
- budget usage
- report release status

### Fields
| Field ID | Type | Required | Description |
|---|---|---:|---|
| run_id | string | yes | current or latest run identifier |
| run_date | date | yes | business date of run |
| run_status | enum | yes | planned, running, success, partial_success, failed |
| active_vendor_count | integer | yes | total active tracked vendors |
| changed_vendor_count | integer | yes | vendors with meaningful delta |
| stale_vendor_count | integer | yes | vendors with freshness_status=stale |
| failed_vendor_count | integer | yes | vendors with failed status in latest run |
| escalation_count_open | integer | yes | currently open escalation events |
| avg_market_maturity | number | yes | average maturity score |
| avg_integration | number | yes | average integration score |
| avg_governance | number | yes | average governance score |
| budget_used_usd | number | yes | estimated budget used for the run |
| budget_limit_usd | number | yes | configured run budget limit |

### Actions
- open run detail
- open failed vendors filter
- open open-escalations list
- open daily report

### Backend Data Dependencies
- latest run summary
- vendor freshness aggregation
- current open escalation count
- latest report summary

---

# 6.2 PAGE_VENDOR_LIST

Page ID: `PAGE_VENDOR_LIST`  
Area: Analyst Workspace  
Primary Roles: all roles

### Purpose
Display all tracked vendors in a sortable and filterable list.

### Table Fields
| Field ID | Type | Required | Description |
|---|---|---:|---|
| vendor_id | string | yes | stable technical identifier |
| vendor_name | string | yes | display name |
| country | string | no | headquarters or primary country |
| region_scope | string | no | EU, DACH, Global-EU, etc. |
| category | enum | yes | vendor category |
| tracking_status | enum | yes | active, inactive, review_queue, blocked |
| market_maturity_score | integer | yes | 0-100 |
| integration_score | integer | yes | 0-100 |
| governance_score | integer | yes | 0-100 |
| overall_score | integer | yes | weighted total |
| confidence | integer | yes | 0-100 |
| freshness_status | enum | yes | fresh, stale, failed, unknown |
| as_of_date | date | yes | data validity date |
| source_run_id | string | yes | run that produced the displayed data |
| delta_status | enum | yes | no_change, changed, new, downgraded, upgraded |
| open_escalation | boolean | yes | true if escalation exists |

### Filters
- vendor_name
- country
- region_scope
- category
- tracking_status
- freshness_status
- score range
- confidence range
- delta_status
- open_escalation

### Actions
- open vendor detail
- add to compare
- export filtered list
- mark for review
- activate / deactivate vendor

### Role Notes
- activate / deactivate vendor: ROLE_OPERATOR, ROLE_ADMIN
- mark for review: ROLE_ANALYST and above

---

# 6.3 PAGE_VENDOR_DETAIL

Page ID: `PAGE_VENDOR_DETAIL`  
Area: Analyst Workspace  
Primary Roles: all roles

### Purpose
Provide a full 360-degree view of a single vendor.

## Sections

### SECTION_VENDOR_MASTERDATA
| Field ID | Type | Required | Description |
|---|---|---:|---|
| vendor_id | string | yes | technical key |
| vendor_name | string | yes | display name |
| legal_entity_name | string | no | legal company name |
| website_url | url | no | canonical website |
| headquarters_country | string | no | HQ country |
| eu_presence | boolean | no | indicates EU presence |
| category | enum | yes | platform, framework, orchestration, vertical_solution, other |
| short_description | text | no | compact profile |
| tracking_status | enum | yes | active, inactive, review_queue, blocked |
| review_queue_reason | text | no | explanation if under review |

### SECTION_VENDOR_SCORING
| Field ID | Type | Required | Description |
|---|---|---:|---|
| market_maturity_score | integer | yes | score dimension |
| integration_score | integer | yes | score dimension |
| governance_score | integer | yes | score dimension |
| overall_score | integer | yes | weighted total |
| confidence | integer | yes | confidence 0-100 |
| confidence_reason | text | no | short explanation |
| scoring_rubric_version | string | yes | rubric version used |
| second_opinion_model | string | no | model used for second opinion |
| score_divergence_pct | number | no | divergence between primary and second opinion |

### SECTION_VENDOR_FRESHNESS
| Field ID | Type | Required | Description |
|---|---|---:|---|
| as_of_date | date | yes | business validity date |
| source_run_id | string | yes | producing run |
| freshness_status | enum | yes | fresh, stale, failed, unknown |
| latest_run_id | string | no | latest available run |
| latest_manifest_ref | string | no | manifest reference |
| snapshot_path | string | no | storage reference |

### SECTION_VENDOR_GOVERNANCE
| Field ID | Type | Required | Description |
|---|---|---:|---|
| eu_hosting_claim | boolean | no | public claim on EU hosting |
| data_residency_eu | enum | no | yes, partial, no, unknown |
| identity_integration | enum | no | none, sso, scim, sso_scim, unknown |
| sso_support | boolean | no | SSO supported |
| audit_logging_claim | boolean | no | audit logging claim available |
| compliance_claims | array<string> | no | claimed certifications or standards |
| security_disclosures | text | no | public security information |
| human_review_required | boolean | no | forced manual review marker |

### SECTION_VENDOR_RELATIONS
| Field ID | Type | Required | Description |
|---|---|---:|---|
| source_count | integer | yes | number of evidence sources |
| latest_evidence_count | integer | yes | evidence entries in current state |
| primary_sources | array<string> | no | main source references |
| source_quality_flag | enum | no | high, medium, low, mixed |

### Actions
- open evidence list filtered by vendor
- open delta list filtered by vendor
- add to compare
- add comment
- propose override
- mark as report relevant

### Role Notes
- propose override: ROLE_LEAD_ANALYST, ROLE_ADMIN, ROLE_GOVERNANCE_OWNER
- comment: ROLE_ANALYST and above

---

# 6.4 PAGE_VENDOR_COMPARE

Page ID: `PAGE_VENDOR_COMPARE`  
Area: Analyst Workspace  
Primary Roles: ROLE_VIEWER and above

### Purpose
Compare multiple vendors side by side.

### Compare Columns
- vendor_name
- country
- category
- market_maturity_score
- integration_score
- governance_score
- overall_score
- confidence
- freshness_status
- score_divergence_pct
- identity_integration
- sso_support
- data_residency_eu
- audit_logging_claim
- last_change_date

### Actions
- remove vendor from compare
- export compare view
- open vendor detail

---

# 6.5 PAGE_DELTA_LIST

Page ID: `PAGE_DELTA_LIST`  
Area: Analyst Workspace  
Primary Roles: all roles

### Purpose
Display changes detected between snapshots.

### Table Fields
| Field ID | Type | Required | Description |
|---|---|---:|---|
| delta_id | string | yes | unique delta identifier |
| vendor_id | string | yes | related vendor |
| vendor_name | string | yes | denormalized display |
| delta_date | date | yes | change date |
| delta_type | enum | yes | change classification |
| impacted_dimension | enum | yes | maturity, integration, governance, confidence, source, freshness |
| old_value | text | no | previous value |
| new_value | text | no | new value |
| severity | enum | yes | low, medium, high, critical |
| confidence | integer | yes | confidence of delta detection |
| source_run_id | string | yes | run producing the delta |
| detected_by | string | yes | task/model identifier |
| review_status | enum | yes | open, in_review, accepted, dismissed, escalated |

### Allowed delta_type Values
- new_vendor_signal
- score_change
- governance_change
- integration_change
- maturity_change
- source_added
- source_removed
- confidence_drop
- stale_to_failed
- failed_to_recovered

### Actions
- open delta detail
- open related vendor
- mark report relevant
- comment
- change review status

### Role Notes
- review status change: ROLE_ANALYST and above
- final review: ROLE_LEAD_ANALYST, ROLE_GOVERNANCE_OWNER, ROLE_ADMIN

---

# 6.6 PAGE_DELTA_DETAIL

Page ID: `PAGE_DELTA_DETAIL`  
Area: Analyst Workspace  
Primary Roles: all roles

### Purpose
Inspect a single change event in full detail.

### Fields
| Field ID | Type | Required | Description |
|---|---|---:|---|
| delta_id | string | yes | delta identifier |
| delta_summary | text | yes | short business summary |
| rationale | text | no | reasoning summary |
| evidence_refs | array<string> | no | linked evidence ids |
| old_structured_state | json | no | previous state fragment |
| new_structured_state | json | no | new state fragment |
| change_reasoning | text | no | detection explanation |
| escalation_triggered | boolean | yes | whether escalation was triggered |
| escalation_ref | string | no | linked escalation event |

---

# 6.7 PAGE_EVIDENCE_LIST

Page ID: `PAGE_EVIDENCE_LIST`  
Area: Analyst Workspace  
Primary Roles: all roles

### Purpose
Provide evidence-level traceability and source inspection.

### Table Fields
| Field ID | Type | Required | Description |
|---|---|---:|---|
| evidence_id | string | yes | unique evidence key |
| vendor_id | string | yes | related vendor |
| source_url | url | yes | public source URL |
| source_type | enum | yes | website, docs, pricing, security, compliance, other |
| source_title | string | no | source title |
| extracted_at | datetime | yes | extraction timestamp |
| claim_type | enum | yes | normalized claim category |
| claim_text | text | yes | extracted claim |
| normalized_value | text | no | normalized value representation |
| extraction_confidence | integer | yes | confidence 0-100 |
| source_public | boolean | yes | must be true per guardrail |
| review_flag | boolean | yes | analyst review flag |
| run_id | string | yes | producing run |

### Allowed claim_type Values
- pricing
- hosting
- residency
- integrations
- security
- compliance
- roadmap
- market_presence
- product_capability
- support_model

### Actions
- open source URL
- open evidence detail
- filter by vendor
- set review flag
- include in report

### Role Notes
- set review flag: ROLE_ANALYST and above

---

# 6.8 PAGE_EVIDENCE_DETAIL

Page ID: `PAGE_EVIDENCE_DETAIL`  
Area: Analyst Workspace  
Primary Roles: all roles

### Purpose
Inspect raw and normalized evidence content.

### Fields
| Field ID | Type | Required | Description |
|---|---|---:|---|
| evidence_id | string | yes | unique identifier |
| vendor_id | string | yes | related vendor |
| raw_excerpt | text | yes | relevant source excerpt |
| structured_output_fragment | json | no | extraction model output fragment |
| extraction_model | string | yes | model used |
| prompt_version | string | no | extraction prompt version |
| schema_version | string | yes | schema version |
| normalization_notes | text | no | normalization commentary |
| provenance_hash | string | no | content hash or provenance marker |

---

# 6.9 PAGE_REPORT_LIST

Page ID: `PAGE_REPORT_LIST`  
Area: Analyst Workspace  
Primary Roles: all roles

### Purpose
Manage and inspect daily and weekly reports.

### Table Fields
| Field ID | Type | Required | Description |
|---|---|---:|---|
| report_id | string | yes | unique report id |
| report_type | enum | yes | daily_report, weekly_digest |
| reporting_period | string | yes | e.g. 2026-04-10 or 2026-W15 |
| generated_at | datetime | yes | generation timestamp |
| source_run_id | string | yes | origin run |
| status | enum | yes | draft, in_review, approved, published, archived |
| author_system | string | yes | creating subsystem |
| reviewer | string | no | assigned reviewer |
| approver | string | no | approving actor |
| version | string | yes | document version |
| export_paths | array<string> | no | generated outputs |
| publication_state | enum | yes | internal, released, archived |

### Actions
- open report detail
- approve report
- export report
- compare versions
- regenerate report

### Role Notes
- approve: ROLE_LEAD_ANALYST, ROLE_GOVERNANCE_OWNER, ROLE_ADMIN
- regenerate: ROLE_OPERATOR, ROLE_ADMIN

---

# 6.10 PAGE_REPORT_DETAIL

Page ID: `PAGE_REPORT_DETAIL`  
Area: Analyst Workspace  
Primary Roles: all roles

### Purpose
Display the full report payload with references.

### Fields
| Field ID | Type | Required | Description |
|---|---|---:|---|
| report_id | string | yes | unique report id |
| title | string | yes | report title |
| executive_summary | text | no | top summary |
| key_movements | text | no | main changes |
| governance_alerts | text | no | governance highlights |
| referenced_vendor_ids | array<string> | no | linked vendors |
| referenced_delta_ids | array<string> | no | linked deltas |
| referenced_evidence_ids | array<string> | no | linked evidence |
| reviewer_comments | text | no | review feedback |
| approval_comment | text | no | approval comment |

---

# 6.11 PAGE_RUN_LIST

Page ID: `PAGE_RUN_LIST`  
Area: Admin / Operations Console  
Primary Roles: ROLE_OPERATOR, ROLE_ADMIN, ROLE_GOVERNANCE_OWNER

### Purpose
List all SCOUT runs and their operational status.

### Table Fields
| Field ID | Type | Required | Description |
|---|---|---:|---|
| run_id | string | yes | unique run identifier |
| run_date | date | yes | business date |
| started_at | datetime | yes | start timestamp |
| finished_at | datetime | no | end timestamp |
| status | enum | yes | planned, running, success, partial_success, failed |
| mode | enum | yes | scheduled, manual, dry_run, retry_failed, digest |
| vendor_scope | text | no | selected vendor scope |
| total_vendors | integer | yes | total vendor count in run |
| success_vendors | integer | yes | successfully processed vendors |
| failed_vendors | integer | yes | failed vendors |
| stale_vendors | integer | yes | stale vendors |
| budget_used_usd | number | yes | run budget usage |
| budget_limit_usd | number | yes | configured budget limit |
| concurrency_limit | integer | yes | vendor concurrency cap |
| initiated_by | string | no | actor or scheduler |
| manifest_ref | string | no | manifest location/reference |

### Actions
- open run detail
- retry failed vendors
- open logs
- open artifacts
- open manifest

---

# 6.12 PAGE_RUN_DETAIL

Page ID: `PAGE_RUN_DETAIL`  
Area: Admin / Operations Console  
Primary Roles: ROLE_OPERATOR, ROLE_ADMIN, ROLE_GOVERNANCE_OWNER

### Purpose
Provide stage-level and artifact-level run diagnostics.

### Fields
| Field ID | Type | Required | Description |
|---|---|---:|---|
| run_id | string | yes | unique run identifier |
| pipeline_stage_status | json | yes | A1-A6 stage status |
| artifact_path_root | string | no | run storage root |
| latest_promoted | boolean | yes | whether promoted to latest |
| manifest_checksum | string | no | manifest checksum |
| max_vendor_concurrency | integer | yes | applied concurrency limit |
| max_budget_usd_per_run | number | yes | applied budget limit |
| dry_run | boolean | yes | dry run marker |
| notes | text | no | operator notes |

### Embedded Subtables
- vendor result table
- stage log table
- error table
- artifacts table

### Actions
- retry failed vendors
- re-open artifacts
- inspect manifest
- export operational summary

---

# 6.13 PAGE_ERROR_LIST

Page ID: `PAGE_ERROR_LIST`  
Area: Admin / Operations Console  
Primary Roles: ROLE_OPERATOR, ROLE_ADMIN, ROLE_GOVERNANCE_OWNER

### Purpose
Central error and exception management.

### Table Fields
| Field ID | Type | Required | Description |
|---|---|---:|---|
| error_id | string | yes | error identifier |
| run_id | string | yes | related run |
| vendor_id | string | no | related vendor if applicable |
| stage | enum | yes | A1, A2, A3, A4, A5, A6, config, system |
| error_type | enum | yes | normalized error type |
| severity | enum | yes | low, medium, high, critical |
| message | text | yes | primary error message |
| first_seen_at | datetime | yes | first observation timestamp |
| retry_status | enum | yes | not_retried, queued, retried, resolved |
| resolution_status | enum | yes | open, investigating, fixed, dismissed |
| assigned_to | string | no | responsible actor |

### Allowed error_type Values
- research_error
- extraction_error
- schema_validation_error
- scoring_error
- persistence_error
- config_error
- budget_limit_exceeded
- provider_error
- timeout
- unknown

### Actions
- assign error
- mark investigating
- retry related vendor
- dismiss error
- open related run

---

# 6.14 PAGE_CONFIGURATION_ROOT

Page ID: `PAGE_CONFIGURATION_ROOT`  
Area: Admin / Operations Console  
Primary Roles: ROLE_OPERATOR, ROLE_ADMIN, ROLE_GOVERNANCE_OWNER

### Purpose
Entry page for configuration sections.

### Child Pages
- PAGE_CONFIG_VENDORS
- PAGE_CONFIG_WEIGHTS
- PAGE_CONFIG_SOURCES
- PAGE_CONFIG_PROVIDERS
- PAGE_CONFIG_LIMITS

---

# 6.15 PAGE_CONFIG_VENDORS

Page ID: `PAGE_CONFIG_VENDORS`  
Area: Admin / Operations Console  
Primary Roles: ROLE_OPERATOR read, ROLE_ADMIN write, ROLE_GOVERNANCE_OWNER read

### Fields
| Field ID | Type | Required | Description |
|---|---|---:|---|
| vendor_id | string | yes | vendor identifier |
| vendor_name | string | yes | display name |
| enabled | boolean | yes | active in scheduled runs |
| category | enum | yes | vendor category |
| country | string | no | country |
| initial_source_set | json | no | configured source seed |
| priority | integer | no | scheduling or review priority |
| manual_review_required | boolean | yes | human review gate |

### Actions
- enable vendor
- disable vendor
- change priority
- mark manual review required

---

# 6.16 PAGE_CONFIG_WEIGHTS

Page ID: `PAGE_CONFIG_WEIGHTS`  
Area: Admin / Operations Console  
Primary Roles: ROLE_ADMIN write, ROLE_GOVERNANCE_OWNER approve

### Fields
| Field ID | Type | Required | Description |
|---|---|---:|---|
| weights_version | string | yes | version id |
| market_maturity_weight | number | yes | relative weight |
| integration_weight | number | yes | relative weight |
| governance_weight | number | yes | relative weight |
| effective_from | date | yes | effective date |
| approved_by | string | no | governance approver |

### Validation Rules
- all weights must be >= 0
- sum of weights must equal 100 or 1.0 depending on storage standard
- version must be unique

---

# 6.17 PAGE_CONFIG_SOURCES

Page ID: `PAGE_CONFIG_SOURCES`  
Area: Admin / Operations Console  
Primary Roles: ROLE_ADMIN write, ROLE_GOVERNANCE_OWNER read

### Fields
| Field ID | Type | Required | Description |
|---|---|---:|---|
| source_id | string | yes | source identifier |
| source_type | enum | yes | public_web, docs, pricing, security, compliance, other |
| allow_public_web | boolean | yes | must align with public-source-only guardrail |
| domain_pattern | string | no | domain matching rule |
| source_priority | integer | no | trust or retrieval priority |
| trust_level | enum | yes | high, medium, low |
| active | boolean | yes | active flag |

---

# 6.18 PAGE_CONFIG_PROVIDERS

Page ID: `PAGE_CONFIG_PROVIDERS`  
Area: Admin / Operations Console  
Primary Roles: ROLE_ADMIN write, ROLE_GOVERNANCE_OWNER read

### Fields
| Field ID | Type | Required | Description |
|---|---|---:|---|
| provider_id | string | yes | provider key |
| provider_name | string | yes | provider name |
| model_name | string | yes | model identifier |
| purpose | enum | yes | research, extraction, scoring_primary, scoring_second_opinion, delta, reporting |
| version | string | yes | version identifier |
| active | boolean | yes | active marker |
| fallback_order | integer | no | fallback sequence |
| cost_profile | string | no | budget classification |
| max_calls_per_run | integer | no | quota safeguard |

---

# 6.19 PAGE_CONFIG_LIMITS

Page ID: `PAGE_CONFIG_LIMITS`  
Area: Admin / Operations Console  
Primary Roles: ROLE_ADMIN write, ROLE_GOVERNANCE_OWNER approve

### Fields
| Field ID | Type | Required | Description |
|---|---|---:|---|
| max_vendor_concurrency | integer | yes | operational limit |
| max_budget_usd_per_run | number | yes | budget cap |
| auto_add_vendors | boolean | yes | should remain false by default |
| allow_vendor_contact | boolean | yes | should remain false |
| public_sources_only | boolean | yes | should remain true |
| low_confidence_threshold | integer | yes | e.g. 70 |
| divergence_escalation_threshold_pct | number | yes | e.g. 15 |
| sharepoint_persistence_only | boolean | yes | guardrail flag |

### Validation Rules
- max_vendor_concurrency must be >= 1
- max_budget_usd_per_run must be > 0
- public_sources_only must default to true
- allow_vendor_contact must default to false
- divergence threshold must be >= 0

---

# 6.20 PAGE_AUDIT_LIST

Page ID: `PAGE_AUDIT_LIST`  
Area: Admin / Operations Console  
Primary Roles: ROLE_ADMIN, ROLE_GOVERNANCE_OWNER

### Purpose
Display all auditable system and governance events.

### Table Fields
| Field ID | Type | Required | Description |
|---|---|---:|---|
| audit_event_id | string | yes | event key |
| event_time | datetime | yes | event timestamp |
| actor_type | enum | yes | user, system, scheduler |
| actor_id | string | yes | actor identifier |
| action_type | enum | yes | action class |
| target_type | enum | yes | config, run, report, vendor, user, role, threshold |
| target_id | string | yes | target identifier |
| before_state | json | no | previous state |
| after_state | json | no | new state |
| reason | text | no | stated reason |
| related_run_id | string | no | linked run |
| related_report_id | string | no | linked report |

### Allowed action_type Values
- config_changed
- run_started
- run_retried
- vendor_status_changed
- report_approved
- override_proposed
- override_approved
- role_changed
- threshold_changed
- source_disabled

---

# 6.21 PAGE_ADMIN_USERS

Page ID: `PAGE_ADMIN_USERS`  
Area: Administration  
Primary Roles: ROLE_ADMIN

### Fields
| Field ID | Type | Required | Description |
|---|---|---:|---|
| user_id | string | yes | internal or external identity key |
| display_name | string | yes | display name |
| email | string | yes | user email |
| role_set | array<string> | yes | assigned roles |
| active | boolean | yes | active flag |
| last_login | datetime | no | last login timestamp |

### Actions
- assign roles
- deactivate user
- reactivate user

---

# 6.22 PAGE_ADMIN_ROLES

Page ID: `PAGE_ADMIN_ROLES`  
Area: Administration  
Primary Roles: ROLE_ADMIN

### Fields
| Field ID | Type | Required | Description |
|---|---|---:|---|
| role_id | string | yes | role key |
| role_name | string | yes | display name |
| permissions | json | yes | permission set |
| description | text | no | explanatory text |

---

# 6.23 PAGE_ADMIN_SHAREPOINT

Page ID: `PAGE_ADMIN_SHAREPOINT`  
Area: Administration  
Primary Roles: ROLE_ADMIN

### Fields
| Field ID | Type | Required | Description |
|---|---|---:|---|
| site_url | url | yes | target site |
| library_name | string | yes | storage library |
| config_path | string | yes | config root |
| snapshot_path | string | yes | snapshot root |
| latest_path | string | yes | latest root |
| manifest_path | string | yes | manifest location |
| connection_status | enum | yes | ok, degraded, failed |
| last_validation | datetime | no | last connection validation |

---

## 7. Escalation Model

## 7.1 Escalation Event Object

Escalation events are triggered when:
- confidence < low_confidence_threshold
- score divergence > divergence_escalation_threshold_pct
- governance-critical change is detected
- repeated vendor failure exceeds policy threshold

### Escalation Fields
| Field ID | Type | Required | Description |
|---|---|---:|---|
| escalation_id | string | yes | unique escalation id |
| escalation_type | enum | yes | low_confidence, divergence, governance_change, repeated_failure |
| severity | enum | yes | low, medium, high, critical |
| linked_vendor_id | string | no | vendor link |
| linked_run_id | string | no | run link |
| linked_delta_id | string | no | delta link |
| status | enum | yes | open, acknowledged, resolved, dismissed |
| owner_role | string | no | responsible role |
| created_at | datetime | yes | creation timestamp |
| resolved_at | datetime | no | resolution timestamp |

---

## 8. Read Model and API Specification

## 8.1 API Principles

- All APIs are versioned under `/api/v1`
- All list endpoints support filtering, sorting, and pagination
- All mutation endpoints require role-based authorization
- All mutation endpoints write audit events
- All analytical detail endpoints expose provenance references

## 8.2 Endpoint Mapping

### Dashboard
- `GET /api/v1/dashboard`

### Vendors
- `GET /api/v1/vendors`
- `GET /api/v1/vendors/{vendor_id}`
- `POST /api/v1/vendors/compare`
- `POST /api/v1/vendors/{vendor_id}/mark-review`
- `POST /api/v1/vendors/{vendor_id}/activate`
- `POST /api/v1/vendors/{vendor_id}/deactivate`

### Deltas
- `GET /api/v1/deltas`
- `GET /api/v1/deltas/{delta_id}`
- `POST /api/v1/deltas/{delta_id}/review-status`
- `POST /api/v1/deltas/{delta_id}/mark-report-relevant`

### Evidence
- `GET /api/v1/evidence`
- `GET /api/v1/evidence/{evidence_id}`
- `POST /api/v1/evidence/{evidence_id}/review-flag`

### Reports
- `GET /api/v1/reports`
- `GET /api/v1/reports/{report_id}`
- `POST /api/v1/reports/{report_id}/approve`
- `POST /api/v1/reports/{report_id}/regenerate`
- `GET /api/v1/reports/{report_id}/export`

### Runs
- `GET /api/v1/runs`
- `GET /api/v1/runs/{run_id}`
- `POST /api/v1/runs`
- `POST /api/v1/runs/{run_id}/retry-failed`

### Errors
- `GET /api/v1/errors`
- `POST /api/v1/errors/{error_id}/assign`
- `POST /api/v1/errors/{error_id}/status`

### Configuration
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

### Administration
- `GET /api/v1/admin/users`
- `PUT /api/v1/admin/users/{user_id}`
- `GET /api/v1/admin/roles`
- `GET /api/v1/admin/sharepoint`
- `POST /api/v1/admin/sharepoint/validate`

---

## 9. Suggested Frontend Route Structure

```text
/app
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

/admin
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

---

## 10. Suggested Component Breakdown

### Shared Components
- `AppShell`
- `TopNav`
- `SideNav`
- `RoleGuard`
- `DataTable`
- `FilterBar`
- `DetailSection`
- `ScoreBadge`
- `FreshnessBadge`
- `ConfidenceBadge`
- `SeverityBadge`
- `StatusBadge`
- `AuditTrailPanel`
- `EvidenceLinkList`
- `JsonInspector`
- `RunStatusHeader`

### Analyst Components
- `VendorListTable`
- `VendorDetailHeader`
- `VendorScoreCard`
- `VendorGovernancePanel`
- `VendorCompareTable`
- `DeltaListTable`
- `DeltaChangePanel`
- `EvidenceListTable`
- `EvidenceDetailPanel`
- `ReportSummaryPanel`

### Admin Components
- `RunListTable`
- `RunDetailPanel`
- `ErrorListTable`
- `ConfigEditor`
- `WeightsEditor`
- `LimitsEditor`
- `ProviderTable`
- `AuditEventTable`
- `UserAdminTable`
- `RoleAdminTable`
- `SharePointHealthPanel`

---

## 11. Suggested Backend Service Modules

- `dashboardService`
- `vendorService`
- `deltaService`
- `evidenceService`
- `reportService`
- `runService`
- `errorService`
- `configService`
- `auditService`
- `userService`
- `sharepointAdminService`

---

## 12. Acceptance Criteria

## 12.1 Global Acceptance Criteria
- Every displayed score links to a producing run and evidence chain.
- Every config mutation creates an audit event.
- Every role-restricted action is protected server-side.
- Every list page supports search, sort, and pagination.
- Every detail page supports provenance inspection where applicable.

## 12.2 Analyst Workspace Acceptance Criteria
- analysts can inspect vendors, evidence, deltas, and reports without using CLI
- compare view supports at least 2-5 vendors
- delta review workflow is role-aware
- report pages expose evidence references

## 12.3 Admin Console Acceptance Criteria
- operators can inspect and control runs
- admins can update configuration safely
- governance owners can inspect audit and escalation events
- connection and limits can be validated from UI

---

## 13. Recommended Implementation Order

### Phase 1
- API foundation
- auth and role middleware
- dashboard
- vendor list
- vendor detail
- run list
- error list

### Phase 2
- delta list/detail
- evidence list/detail
- report list/detail
- compare view

### Phase 3
- configuration pages
- audit page
- sharepoint admin page
- user and role administration

### Phase 4
- escalation workflows
- advanced exports
- report approval workflow hardening
- richer trend visualization

---

## 14. Open Implementation Decisions

The following decisions should be made before coding begins:

1. frontend stack: React + Vite recommended
2. UI state management: TanStack Query + local UI store recommended
3. backend framework: Fastify or Express
4. auth provider: Entra ID recommended
5. read model storage: optional local operational DB recommended for fast dashboards
6. report rendering strategy: markdown-to-html plus export pipeline
7. JSON field rendering strategy in detail pages
8. whether audit detail is embedded or separate

---

## 15. Non-Goals

The following are out of scope for the first UI implementation:

- direct vendor contact workflows
- auto-onboarding of new vendors without review
- editing evidence payloads by hand
- bypassing SharePoint provenance
- replacing the CLI processing core
- real-time streaming dashboards unless added later

---

## 16. Deliverable Mapping for Codex

Codex should be able to derive the following deliverables directly from this specification:

- route skeleton
- page component skeleton
- TypeScript domain types
- API client modules
- RBAC middleware
- table and form schemas
- validation schemas
- placeholder test cases
- navigation shell
- acceptance-test checklist

End of document.
