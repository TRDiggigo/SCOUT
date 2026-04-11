import { describe, it, expect } from "vitest";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import { evidenceFileSchema, vendorEvidenceSchema } from "../src/evidence/schema.js";
import { scoresFileSchema, scoreEntrySchema } from "../src/scoring/schema.js";
import { rubricBatchSchema, vendorRubricSchema } from "../src/scoring/rubric.schema.js";
import { makeEvidence, makeScoresFile, makeRubric } from "./fixtures.js";

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

describe("schemas compile and validate fixtures", () => {
  it("compiles and validates evidence file fixture", () => {
    const validate = ajv.compile(evidenceFileSchema);
    const sample = {
      run_id: "2026-04-08T060000Z-deadbee-01",
      generated_at: new Date().toISOString(),
      vendors: [makeEvidence()]
    };
    const ok = validate(sample);
    expect(validate.errors ?? []).toEqual([]);
    expect(ok).toBe(true);
  });

  it("rejects evidence item missing source_url", () => {
    const validate = ajv.compile(vendorEvidenceSchema);
    const bad = {
      vendor_id: "x",
      evidence: [
        {
          claim: "no source",
          dimension: "maturity",
          source_type: "vendor",
          published_at: "2026-04-01",
          retrieved_at: new Date().toISOString(),
          relevance: 0.8
        }
      ]
    };
    expect(validate(bad)).toBe(false);
  });

  it("compiles and validates scores file fixture", () => {
    const validate = ajv.compile(scoresFileSchema);
    const sample = makeScoresFile("2026-04-08T060000Z-deadbee-01", [{ vendor_id: "v1" }]);
    const ok = validate(sample);
    expect(validate.errors ?? []).toEqual([]);
    expect(ok).toBe(true);
  });

  it("rejects score entry missing tier", () => {
    const validate = ajv.compile(scoreEntrySchema);
    const sample = makeScoresFile("rid", [{ vendor_id: "v1" }]).vendors[0];
    delete sample.tier;
    expect(validate(sample)).toBe(false);
  });

  it("compiles rubric schemas and validates fixture", () => {
    const validate = ajv.compile(vendorRubricSchema);
    expect(validate(makeRubric())).toBe(true);
    const batchValidate = ajv.compile(rubricBatchSchema);
    expect(batchValidate({ vendors: [makeRubric()] })).toBe(true);
  });
});
