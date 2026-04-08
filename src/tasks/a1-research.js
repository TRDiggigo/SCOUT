// A1 Web Research. Knows nothing about model IDs or web-search tool versions —
// it asks the AnthropicAdapter for `researchWithWebSearch(...)`.

import { logger } from "../util/logger.js";

const QUERY_DIMENSIONS = ["maturity", "integration", "governance"];

export function buildVendorQueries(vendor, sources) {
  const year = new Date().getUTCFullYear();
  const aliases = vendor.search_aliases?.length ? vendor.search_aliases : [vendor.name];
  const primary = aliases[0];
  const dims = sources?.query_dimensions ?? {};
  const queries = [];
  for (const dim of QUERY_DIMENSIONS) {
    const angles = dims[dim] ?? [];
    if (angles.length === 0) continue;
    queries.push(`${primary} ${angles[0]} ${year}`);
  }
  // Add a recent-news angle so funding/regulator updates surface even when the dimensional queries miss them.
  queries.push(`${primary} announcement ${year} EU AI Act`);
  return queries.slice(0, 4);
}

export async function runResearch({ vendors, anthropic, sources, searchCounter, budget, log = logger }) {
  const results = [];
  for (const vendor of vendors) {
    const queries = buildVendorQueries(vendor, sources);
    try {
      searchCounter.reserve(vendor.vendor_id, queries.length);
    } catch (err) {
      log.warn("vendor skipped — search limit", { vendor_id: vendor.vendor_id, err: err.message });
      results.push({ vendor_id: vendor.vendor_id, error: err.message });
      continue;
    }
    try {
      const { text, raw_results, usage, model } = await anthropic.researchWithWebSearch({ vendor, queries });
      budget.charge({
        usd: estimateCost(model, usage),
        tokens: (usage?.input_tokens ?? 0) + (usage?.output_tokens ?? 0),
        calls: 1
      });
      results.push({
        vendor_id: vendor.vendor_id,
        queries,
        text,
        raw_results,
        usage
      });
    } catch (err) {
      log.error("research failed", { vendor_id: vendor.vendor_id, err: String(err?.message ?? err) });
      results.push({ vendor_id: vendor.vendor_id, error: String(err?.message ?? err) });
    }
  }
  return results;
}

// Rough USD estimate for budget tracking. Tasks must not block on exact pricing —
// the budget tracker is a runaway guard, not an accountant.
function estimateCost(model, usage) {
  if (!usage) return 0;
  const input = usage.input_tokens ?? 0;
  const output = usage.output_tokens ?? 0;
  const isOpus = String(model ?? "").includes("opus");
  const inputRate = isOpus ? 15 / 1_000_000 : 3 / 1_000_000;
  const outputRate = isOpus ? 75 / 1_000_000 : 15 / 1_000_000;
  return input * inputRate + output * outputRate;
}
