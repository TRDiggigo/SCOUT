# SCOUT — Strategic Competitive Observation & Update Tracker

KI-Agent-Marktbeobachtung Europa. Liefert täglich eine strukturierte Marktübersicht über KI-basierte Agenten-Plattformen mit Fokus auf den europäischen Markt, bewertet entlang **Marktreife / Integration / Governance**.

Implementiert nach Agent Contract `DIG-AGENT-2026-001` v1.0 (Diggigo GmbH).

## Pipeline (A1 → A6)

| Task | Beschreibung | Modell |
|------|--------------|--------|
| A1 | Web Research (Anthropic Web Search) | Sonnet |
| A2 | Strukturierte Extraction → `evidence.json` | Sonnet (Structured Output) |
| A3 | Scoring → `scores.json` | Opus (Structured Output), GPT-4o als Second-Opinion |
| A4 | Delta-Detection vs. Vortags-`latest/` | Sonnet |
| A5 | Markdown-Report + Wochendigest | Sonnet |
| A6 | Persistierung in SharePoint via Graph | — |

## CLI

```bash
# Einmalig: Site, Listen, Ordner provisionieren und Configs seeden
scout bootstrap-sharepoint

# Schema-Check der Remote-Konfiguration
scout validate-config

# Tageslauf
scout run --date=2026-04-08
scout run --vendors=vendor-a,vendor-b --dry-run

# Wochendigest
scout digest --week=2026-W15
```

## Architektur

```
src/
├── index.js                 # CLI dispatcher
├── pipeline.js              # A1→A6 Orchestrierung
├── tasks/                   # a1-research … a6-persist
├── llm/                     # anthropic, openai (Adapter, kein Hardcoding)
├── sharepoint/              # client, repository, files, bootstrap, list-definitions
├── scoring/                 # model, schema, rubric.schema, confidence
├── evidence/                # schema (Output von A2)
├── config/                  # loader (lädt Remote-Configs aus SP)
└── util/                    # runid, audit, limits, logger
config/
├── vendors.json             # Seed: 10 EU-Anbieter
├── weights.json             # Seed: 40/30/30
├── sources.json             # Seed
└── providers.json           # Modell-/Tool-Versionen, beweglich
```

## Run-Idempotenz

Jeder Lauf erzeugt eine `run_id = <date>T<HHMMSS>Z-<shortSha>-<attempt>`. Artefakte landen in `/SCOUT/data/{date}/{run_id}/`. Bei Erfolg promotet A6 die Artefakte als Snapshot-Kopie nach `/SCOUT/data/{date}/latest/` und schreibt `latest.manifest.json` mit Provenance. Pro Vendor werden in `latest/scores.json` `as_of_date`, `source_run_id`, `freshness_status` mitgeführt — Dashboards erkennen `stale`/`failed` Vendors sofort.

## Guardrails

- Keine Vendor-Kontaktaufnahme, keine Auto-Add neuer Vendors (Human Review Queue), nur öffentliche Quellen, nur SharePoint-Persistenz.
- Vendor-isolierte Fehlerbehandlung: Ausfall eines Vendors bricht den Run nicht ab.
- Budget- und Concurrency-Limits in Code (`MAX_VENDOR_CONCURRENCY=3`, `MAX_BUDGET_USD_PER_RUN=10`, …).
- Dual-LLM-Validierung bei Konfidenz <70%; Abweichung >15 → Eskalations-Event.

## Tests

```bash
npm test
```

Deckt Scoring-Reproduzierbarkeit (±5), Delta-Fixtures, Schema-Validation, Konfidenz-Edge-Cases und einen mockten End-to-End-Lauf ab.
