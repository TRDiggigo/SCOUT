// JSON Schema for A3 Scoring rubric output. Drives Claude Opus tool_use input_schema
// and OpenAI response_format json_schema for the second-opinion path.

export const dimensionSubscoresSchema = {
  type: "object",
  additionalProperties: false,
  required: ["subscores", "rationale"],
  properties: {
    subscores: {
      type: "object",
      additionalProperties: false,
      patternProperties: {
        "^[a-z_]+$": { type: "number", minimum: 0, maximum: 100 }
      }
    },
    rationale: { type: "string", minLength: 10, maxLength: 800 },
    uncertainty_markers: {
      type: "array",
      items: { type: "string", maxLength: 200 },
      maxItems: 10
    }
  }
};

export const vendorRubricSchema = {
  type: "object",
  additionalProperties: false,
  required: ["vendor_id", "maturity", "integration", "governance"],
  properties: {
    vendor_id: { type: "string", minLength: 1 },
    maturity: dimensionSubscoresSchema,
    integration: dimensionSubscoresSchema,
    governance: dimensionSubscoresSchema,
    risk_level: { type: "string", enum: ["low", "medium", "high"] },
    trend: { type: "string", enum: ["up", "stable", "down"] }
  }
};

export const rubricBatchSchema = {
  type: "object",
  additionalProperties: false,
  required: ["vendors"],
  properties: {
    vendors: { type: "array", items: vendorRubricSchema }
  }
};
