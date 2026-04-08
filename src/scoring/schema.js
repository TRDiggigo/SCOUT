// JSON Schema for scores.json — single source of truth for the persisted score artefact.
// Mirrors §8.1 of the agent contract.

export const scoreEntrySchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "vendor_id",
    "name",
    "country",
    "type",
    "segment",
    "tier",
    "scores",
    "risk_level",
    "trend",
    "last_updated",
    "sources",
    "as_of_date",
    "source_run_id",
    "freshness_status"
  ],
  properties: {
    vendor_id: { type: "string", minLength: 1 },
    name: { type: "string" },
    country: { type: "string", minLength: 2, maxLength: 3 },
    city: { type: "string" },
    type: { type: "string" },
    segment: { type: "string" },
    tier: { type: "string", enum: ["EU-Native", "EU-Adjacent", "Global"] },
    scores: {
      type: "object",
      additionalProperties: false,
      required: ["maturity", "integration", "governance", "total"],
      properties: {
        maturity: { type: "number", minimum: 0, maximum: 100 },
        integration: { type: "number", minimum: 0, maximum: 100 },
        governance: { type: "number", minimum: 0, maximum: 100 },
        total: { type: "number", minimum: 0, maximum: 100 }
      }
    },
    confidence: { type: "number", minimum: 0, maximum: 1 },
    funding_total: { type: ["number", "null"] },
    valuation: { type: ["number", "null"] },
    arr_estimate: { type: ["number", "null"] },
    risk_level: { type: "string", enum: ["low", "medium", "high"] },
    trend: { type: "string", enum: ["up", "stable", "down"] },
    last_updated: { type: "string", format: "date-time" },
    sources: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["url", "confidence"],
        properties: {
          url: { type: "string", format: "uri" },
          confidence: { type: "number", minimum: 0, maximum: 1 },
          source_type: {
            type: "string",
            enum: ["vendor", "news", "analyst", "regulator"]
          }
        }
      }
    },
    delta: {
      type: "object",
      additionalProperties: true,
      properties: {
        changed_fields: { type: "array", items: { type: "string" } },
        previous_values: { type: "object", additionalProperties: true }
      }
    },
    as_of_date: { type: "string", format: "date" },
    source_run_id: { type: "string" },
    freshness_status: { type: "string", enum: ["current", "stale", "failed"] },
    confidence_reasons: { type: "array", items: { type: "string" } },
    error: { type: "string" }
  }
};

export const scoresFileSchema = {
  type: "object",
  additionalProperties: false,
  required: ["run_id", "generated_at", "vendors"],
  properties: {
    run_id: { type: "string" },
    generated_at: { type: "string", format: "date-time" },
    vendors: { type: "array", items: scoreEntrySchema }
  }
};
