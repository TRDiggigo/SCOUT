// Operational confidence calculation. The LLM never tells us "how confident it is";
// confidence is computed deterministically from observable evidence properties.
//
// Inputs:
//   - vendorEvidence: { vendor_id, evidence: [...] } from evidence.json
//   - rubric: A3 rubric output (subscores per dimension)
//   - secondOpinion: optional second-rubric from GPT-4o for cross-model deviation
//
// Output: { confidence: 0..1, reasons: [...] }

const REQUIRED_DIMENSIONS = ["maturity", "integration", "governance"];
const FRESHNESS_HALF_LIFE_DAYS = 180;

export function computeConfidence({ vendorEvidence, rubric, secondOpinion = null, now = new Date() } = {}) {
  const reasons = [];
  const evidence = vendorEvidence?.evidence ?? [];

  // 1. Schema completeness — all three dimensions present in rubric.
  const dimsPresent = REQUIRED_DIMENSIONS.filter((d) => rubric?.[d]?.subscores).length;
  const completeness = dimsPresent / REQUIRED_DIMENSIONS.length;
  if (completeness < 1) reasons.push(`only ${dimsPresent}/3 rubric dimensions present`);

  // 2. Evidence density — items per dimension, capped at 4.
  const perDim = REQUIRED_DIMENSIONS.map((d) => evidence.filter((e) => e.dimension === d).length);
  const densityScore = perDim.reduce((acc, n) => acc + Math.min(n, 4) / 4, 0) / REQUIRED_DIMENSIONS.length;
  const minDim = Math.min(...perDim);
  if (minDim === 0) reasons.push("at least one dimension has zero evidence items");

  // 3. Source diversity — distinct source_type values.
  const distinctTypes = new Set(evidence.map((e) => e.source_type).filter(Boolean));
  const diversity = Math.min(distinctTypes.size, 3) / 3;
  if (distinctTypes.size <= 1) reasons.push(`source diversity low (${distinctTypes.size} types)`);

  // 4. Source freshness — exponential decay on median age in days.
  // No evidence at all → freshness 0 (you cannot be fresh with no data).
  const ages = evidence
    .map((e) => ageInDays(e.published_at, now))
    .filter((n) => Number.isFinite(n));
  let freshness = 0;
  if (ages.length > 0) {
    const median = medianOf(ages);
    freshness = Math.exp(-Math.max(0, median) / FRESHNESS_HALF_LIFE_DAYS);
    if (median > 365) reasons.push(`median evidence age ${Math.round(median)}d > 1y`);
  } else {
    reasons.push("no evidence published_at parseable");
  }

  // 5. Cross-model deviation penalty (if a second opinion exists).
  let crossModelScore = 1;
  if (secondOpinion) {
    const dev = maxDimensionDeviation(rubric, secondOpinion);
    if (dev > 30) {
      crossModelScore = 0.4;
      reasons.push(`cross-model deviation ${dev.toFixed(0)} pts (>30)`);
    } else if (dev > 15) {
      crossModelScore = 0.7;
      reasons.push(`cross-model deviation ${dev.toFixed(0)} pts (>15)`);
    }
  }

  const weighted =
    completeness * 0.25 +
    densityScore * 0.25 +
    diversity * 0.15 +
    freshness * 0.20 +
    crossModelScore * 0.15;

  return { confidence: clamp01(weighted), reasons };
}

export function needsSecondOpinion(confidence, threshold = 0.7) {
  return confidence < threshold;
}

export function maxDimensionDeviation(rubricA, rubricB) {
  let max = 0;
  for (const dim of REQUIRED_DIMENSIONS) {
    const a = avgSubscores(rubricA?.[dim]?.subscores);
    const b = avgSubscores(rubricB?.[dim]?.subscores);
    if (a === null || b === null) continue;
    max = Math.max(max, Math.abs(a - b));
  }
  return max;
}

function avgSubscores(s) {
  if (!s) return null;
  const vals = Object.values(s).filter((v) => typeof v === "number");
  if (vals.length === 0) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

function ageInDays(dateStr, now) {
  if (!dateStr) return Number.NaN;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return Number.NaN;
  return (now - d) / 86_400_000;
}

function medianOf(arr) {
  const sorted = [...arr].sort((a, b) => a - b);
  const m = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[m - 1] + sorted[m]) / 2 : sorted[m];
}

function clamp01(v) {
  if (Number.isNaN(v) || v < 0) return 0;
  if (v > 1) return 1;
  return v;
}
