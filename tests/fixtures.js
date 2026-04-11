// Shared fixtures used by multiple test files.

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");

export function loadConfigFixtures() {
  return {
    vendors: JSON.parse(readFileSync(join(root, "config/vendors.json"), "utf8")),
    weights: JSON.parse(readFileSync(join(root, "config/weights.json"), "utf8")),
    sources: JSON.parse(readFileSync(join(root, "config/sources.json"), "utf8")),
    providers: JSON.parse(readFileSync(join(root, "config/providers.json"), "utf8"))
  };
}

export function makeRubric(overrides = {}) {
  return {
    vendor_id: "test-vendor",
    maturity: {
      subscores: {
        production_deployments: 80,
        arr_estimate_usd: 70,
        customer_base: 60,
        release_cadence: 60,
        case_studies_public: 60
      },
      rationale: "Strong production footprint."
    },
    integration: {
      subscores: {
        connector_count: 70,
        protocol_support: 70,
        self_hosting: 60,
        erp_anbindung: 70,
        sdk_languages: 60
      },
      rationale: "Good API coverage."
    },
    governance: {
      subscores: {
        eu_ai_act_readiness: 80,
        iso_certifications: 60,
        dsgvo_proof: 100,
        data_residency_eu: 100,
        audit_trail: 60,
        human_in_the_loop: 60
      },
      rationale: "EU residency and DSGVO documented."
    },
    risk_level: "low",
    trend: "stable",
    ...overrides
  };
}

export function makeEvidence({ vendorId = "test-vendor", count = 9, dimensionMix = true } = {}) {
  const today = new Date().toISOString();
  const sourceTypes = ["vendor", "news", "analyst", "regulator"];
  const dims = ["maturity", "integration", "governance"];
  const items = [];
  for (let i = 0; i < count; i++) {
    items.push({
      claim: `Claim #${i + 1} for ${vendorId}`,
      dimension: dimensionMix ? dims[i % dims.length] : "maturity",
      source_url: `https://example.com/${vendorId}/${i}`,
      source_type: sourceTypes[i % sourceTypes.length],
      published_at: "2026-03-01",
      retrieved_at: today,
      relevance: 0.8
    });
  }
  return { vendor_id: vendorId, evidence: items };
}

export function makeScoresFile(runId, vendors) {
  return {
    run_id: runId,
    generated_at: new Date().toISOString(),
    vendors: vendors.map((v) => ({
      vendor_id: v.vendor_id,
      name: v.name ?? v.vendor_id,
      country: v.country ?? "DE",
      city: v.city ?? "Berlin",
      type: v.type ?? "agent-platform",
      segment: v.segment ?? "general",
      tier: v.tier ?? "EU-Native",
      scores: v.scores ?? { maturity: 70, integration: 65, governance: 80, total: 71.5 },
      confidence: v.confidence ?? 0.85,
      funding_total: null,
      valuation: null,
      arr_estimate: null,
      risk_level: v.risk_level ?? "low",
      trend: v.trend ?? "stable",
      last_updated: new Date().toISOString(),
      sources: v.sources ?? [{ url: "https://example.com", confidence: 0.9, source_type: "vendor" }],
      delta: { changed_fields: [], previous_values: {} },
      as_of_date: new Date().toISOString().slice(0, 10),
      source_run_id: runId,
      freshness_status: v.freshness_status ?? "current"
    }))
  };
}
