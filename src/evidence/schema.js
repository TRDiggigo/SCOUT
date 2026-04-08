// JSON Schema for evidence.json — output of A2 Extraction.
// Single source of truth used both for Anthropic Structured Output (tool_use input_schema)
// and for Ajv runtime validation.

export const evidenceItemSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "claim",
    "dimension",
    "source_url",
    "source_type",
    "published_at",
    "retrieved_at",
    "relevance"
  ],
  properties: {
    claim: { type: "string", minLength: 4, maxLength: 500 },
    dimension: { type: "string", enum: ["maturity", "integration", "governance"] },
    source_url: { type: "string", format: "uri" },
    source_type: {
      type: "string",
      enum: ["vendor", "news", "analyst", "regulator"]
    },
    published_at: { type: "string", format: "date" },
    retrieved_at: { type: "string", format: "date-time" },
    relevance: { type: "number", minimum: 0, maximum: 1 },
    notes: { type: "string", maxLength: 500 }
  }
};

export const vendorEvidenceSchema = {
  type: "object",
  additionalProperties: false,
  required: ["vendor_id", "evidence"],
  properties: {
    vendor_id: { type: "string", minLength: 1 },
    evidence: {
      type: "array",
      minItems: 0,
      maxItems: 50,
      items: evidenceItemSchema
    },
    notes: { type: "string", maxLength: 1000 }
  }
};

export const evidenceFileSchema = {
  type: "object",
  additionalProperties: false,
  required: ["run_id", "generated_at", "vendors"],
  properties: {
    run_id: { type: "string" },
    generated_at: { type: "string", format: "date-time" },
    vendors: { type: "array", items: vendorEvidenceSchema }
  }
};
