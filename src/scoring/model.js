// Deterministic scoring math. The LLM produces sub-scores via the rubric schema; this
// module weighs them according to weights.json. No rounding magic, no LLM math.

const DEFAULT_WEIGHTS = { maturity: 0.4, integration: 0.3, governance: 0.3 };

function clamp(value) {
  if (Number.isNaN(value) || value === null || value === undefined) return 0;
  if (value < 0) return 0;
  if (value > 100) return 100;
  return value;
}

export function weightedDimensionScore(criteria, subscores) {
  if (!Array.isArray(criteria) || criteria.length === 0) return 0;
  let total = 0;
  let weightSum = 0;
  for (const c of criteria) {
    const raw = subscores?.[c.key];
    if (raw === undefined || raw === null) continue;
    total += clamp(raw) * c.weight;
    weightSum += c.weight;
  }
  if (weightSum === 0) return 0;
  // If some criteria are missing, normalize by the weights we *did* observe so the
  // result stays comparable instead of artificially low.
  return total / weightSum;
}

export function computeScores({ rubric, weights }) {
  const dims = weights?.dimensions ?? {};
  const dimWeights = {
    maturity: dims.maturity?.weight ?? DEFAULT_WEIGHTS.maturity,
    integration: dims.integration?.weight ?? DEFAULT_WEIGHTS.integration,
    governance: dims.governance?.weight ?? DEFAULT_WEIGHTS.governance
  };

  const maturity = weightedDimensionScore(dims.maturity?.criteria ?? [], rubric.maturity?.subscores);
  const integration = weightedDimensionScore(
    dims.integration?.criteria ?? [],
    rubric.integration?.subscores
  );
  const governance = weightedDimensionScore(
    dims.governance?.criteria ?? [],
    rubric.governance?.subscores
  );

  const total =
    maturity * dimWeights.maturity +
    integration * dimWeights.integration +
    governance * dimWeights.governance;

  return {
    maturity: round2(maturity),
    integration: round2(integration),
    governance: round2(governance),
    total: round2(total)
  };
}

function round2(value) {
  return Math.round(value * 100) / 100;
}
