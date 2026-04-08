// Audit utility: hashes inputs and outputs for the run-manifest, computes the
// effective config_hash from the *remote* loaded configs (not local fallbacks).

import { createHash } from "node:crypto";

export function hashJson(value) {
  const canonical = JSON.stringify(canonicalize(value));
  return createHash("sha256").update(canonical).digest("hex");
}

function canonicalize(value) {
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(canonicalize);
  return Object.keys(value)
    .sort()
    .reduce((acc, key) => {
      acc[key] = canonicalize(value[key]);
      return acc;
    }, {});
}

export function configHash({ vendors, weights, sources, providers }) {
  return hashJson({ vendors, weights, sources, providers });
}

export function auditEntry({ task, inputs, outputs, started_at, finished_at, status, error }) {
  return {
    task,
    started_at,
    finished_at,
    duration_ms:
      finished_at && started_at ? new Date(finished_at) - new Date(started_at) : null,
    status,
    input_hash: inputs ? hashJson(inputs) : null,
    output_hash: outputs ? hashJson(outputs) : null,
    error: error ? String(error?.message ?? error) : null
  };
}
