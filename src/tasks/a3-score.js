// A3 Scoring. Consumes ONLY evidence.json (not raw search). Two LLMs may participate:
// Opus produces the rubric; if confidence < threshold, GPT-4o is asked for a second opinion.
// Final scores are computed by deterministic JS, never by the LLM.

import Ajv from "ajv";
import addFormats from "ajv-formats";
import { rubricBatchSchema, vendorRubricSchema } from "../scoring/rubric.schema.js";
import { scoresFileSchema } from "../scoring/schema.js";
import { computeScores } from "../scoring/model.js";
import { computeConfidence, needsSecondOpinion, maxDimensionDeviation } from "../scoring/confidence.js";
import { logger } from "../util/logger.js";

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const validateRubric = ajv.compile(vendorRubricSchema);
const validateScoresFile = ajv.compile(scoresFileSchema);

const SYSTEM_PROMPT =
  "You are SCOUT's strict scoring analyst. For each vendor, return numeric subscores 0-100 " +
  "for the criteria listed in the prompt, with a short rationale and any uncertainty markers. " +
  "Stay grounded in the supplied evidence. Do not invent facts.";

export async function runScoring({
  runId,
  vendors,
  evidenceFile,
  weights,
  providers,
  anthropic,
  openai,
  budget,
  events
}) {
  const threshold = providers?.scoring?.second_opinion_confidence_threshold ?? 0.7;
  const warnDelta = providers?.scoring?.cross_model_warning_delta_points ?? 15;

  const out = [];
  for (const vendor of vendors) {
    const vendorEvidence = evidenceFile.vendors.find((v) => v.vendor_id === vendor.vendor_id) ?? {
      vendor_id: vendor.vendor_id,
      evidence: []
    };

    let primaryRubric;
    let secondRubric = null;
    try {
      primaryRubric = await callRubric(anthropic, vendor, vendorEvidence, weights);
      budget.charge({ usd: 0.05, calls: 1 }); // coarse anchor; real usage tracked elsewhere
    } catch (err) {
      logger.error("primary scoring failed", { vendor_id: vendor.vendor_id, err: String(err?.message ?? err) });
      out.push(failedScoreEntry(vendor, runId, err));
      events.push({ type: "primary_scoring_failed", vendor_id: vendor.vendor_id, error: String(err?.message ?? err) });
      continue;
    }

    let { confidence, reasons } = computeConfidence({ vendorEvidence, rubric: primaryRubric });

    if (needsSecondOpinion(confidence, threshold) && openai) {
      try {
        secondRubric = await callRubric(openai, vendor, vendorEvidence, weights, { secondOpinion: true });
        budget.charge({ usd: 0.05, calls: 1 });
        const recalc = computeConfidence({
          vendorEvidence,
          rubric: primaryRubric,
          secondOpinion: secondRubric
        });
        confidence = recalc.confidence;
        reasons = recalc.reasons;
        const dev = maxDimensionDeviation(primaryRubric, secondRubric);
        if (dev > warnDelta) {
          events.push({
            type: "cross_model_deviation",
            severity: "warning",
            vendor_id: vendor.vendor_id,
            deviation_points: dev,
            threshold: warnDelta
          });
        }
      } catch (err) {
        logger.warn("second-opinion failed, keeping primary", {
          vendor_id: vendor.vendor_id,
          err: String(err?.message ?? err)
        });
        events.push({
          type: "second_opinion_failed",
          severity: "info",
          vendor_id: vendor.vendor_id,
          error: String(err?.message ?? err)
        });
      }
    }

    const finalRubric = mergeRubrics(primaryRubric, secondRubric);
    const scores = computeScores({ rubric: finalRubric, weights });
    out.push(buildScoreEntry({ vendor, runId, finalRubric, scores, confidence, reasons, vendorEvidence }));
  }

  const file = {
    run_id: runId,
    generated_at: new Date().toISOString(),
    vendors: out
  };
  if (!validateScoresFile(file)) {
    throw new Error(`scores.json failed schema validation: ${JSON.stringify(validateScoresFile.errors)}`);
  }
  return file;
}

async function callRubric(adapter, vendor, vendorEvidence, weights, { secondOpinion = false } = {}) {
  const userPrompt = buildScoringPrompt(vendor, vendorEvidence, weights);
  const { data } = secondOpinion
    ? await adapter.scoreRubric({ system: SYSTEM_PROMPT, userPrompt, schema: vendorRubricSchema })
    : await adapter.scoreRubric({ system: SYSTEM_PROMPT, userPrompt, schema: vendorRubricSchema });
  if (!validateRubric(data)) {
    throw new Error(`rubric schema validation failed: ${JSON.stringify(validateRubric.errors)}`);
  }
  return data;
}

function buildScoringPrompt(vendor, vendorEvidence, weights) {
  const dims = weights?.dimensions ?? {};
  const criteriaList = Object.entries(dims)
    .map(([dim, def]) => {
      const items = (def.criteria ?? []).map((c) => `    - ${c.key} (rubric: ${c.rubric})`).join("\n");
      return `  ${dim} (weight ${def.weight}):\n${items}`;
    })
    .join("\n");
  const evidenceDump = (vendorEvidence?.evidence ?? [])
    .map(
      (e, i) =>
        `  ${i + 1}. [${e.dimension}] ${e.claim} — ${e.source_url} (${e.source_type}, ${e.published_at})`
    )
    .join("\n");

  return [
    `Vendor: ${vendor.name} (${vendor.vendor_id}, ${vendor.country}, tier=${vendor.tier})`,
    `Score the following criteria 0..100 each. Use the evidence below; if no evidence covers a key, use the lowest defensible value.`,
    `Criteria:`,
    criteriaList,
    `Evidence:`,
    evidenceDump || "  (none)"
  ].join("\n");
}

function mergeRubrics(primary, second) {
  if (!second) return primary;
  const out = { vendor_id: primary.vendor_id };
  for (const dim of ["maturity", "integration", "governance"]) {
    const a = primary[dim]?.subscores ?? {};
    const b = second[dim]?.subscores ?? {};
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    const subscores = {};
    for (const k of keys) {
      const va = a[k];
      const vb = b[k];
      if (typeof va === "number" && typeof vb === "number") subscores[k] = (va + vb) / 2;
      else if (typeof va === "number") subscores[k] = va;
      else if (typeof vb === "number") subscores[k] = vb;
    }
    out[dim] = {
      subscores,
      rationale: primary[dim]?.rationale ?? "",
      uncertainty_markers: [
        ...(primary[dim]?.uncertainty_markers ?? []),
        ...(second[dim]?.uncertainty_markers ?? [])
      ]
    };
  }
  out.risk_level = primary.risk_level ?? second.risk_level ?? "medium";
  out.trend = primary.trend ?? second.trend ?? "stable";
  return out;
}

function buildScoreEntry({ vendor, runId, finalRubric, scores, confidence, reasons, vendorEvidence }) {
  const today = new Date().toISOString().slice(0, 10);
  return {
    vendor_id: vendor.vendor_id,
    name: vendor.name,
    country: vendor.country,
    city: vendor.city,
    type: vendor.type,
    segment: vendor.segment,
    tier: vendor.tier,
    scores,
    confidence,
    funding_total: null,
    valuation: null,
    arr_estimate: null,
    risk_level: finalRubric.risk_level ?? "medium",
    trend: finalRubric.trend ?? "stable",
    last_updated: new Date().toISOString(),
    sources: (vendorEvidence?.evidence ?? []).map((e) => ({
      url: e.source_url,
      confidence: e.relevance,
      source_type: e.source_type
    })),
    delta: { changed_fields: [], previous_values: {} },
    as_of_date: today,
    source_run_id: runId,
    freshness_status: "current",
    confidence_reasons: reasons
  };
}

function failedScoreEntry(vendor, runId, err) {
  const today = new Date().toISOString().slice(0, 10);
  return {
    vendor_id: vendor.vendor_id,
    name: vendor.name,
    country: vendor.country,
    city: vendor.city,
    type: vendor.type,
    segment: vendor.segment,
    tier: vendor.tier,
    scores: { maturity: 0, integration: 0, governance: 0, total: 0 },
    confidence: 0,
    funding_total: null,
    valuation: null,
    arr_estimate: null,
    risk_level: "high",
    trend: "stable",
    last_updated: new Date().toISOString(),
    sources: [],
    delta: { changed_fields: [], previous_values: {} },
    as_of_date: today,
    source_run_id: runId,
    freshness_status: "failed",
    error: String(err?.message ?? err)
  };
}
