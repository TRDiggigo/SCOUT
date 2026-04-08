import { describe, it, expect } from "vitest";
import { computeScores, weightedDimensionScore } from "../src/scoring/model.js";
import { loadConfigFixtures, makeRubric } from "./fixtures.js";

const { weights } = loadConfigFixtures();

describe("scoring/model", () => {
  it("weights criteria deterministically", () => {
    const criteria = [
      { key: "a", weight: 0.5, rubric: "" },
      { key: "b", weight: 0.5, rubric: "" }
    ];
    expect(weightedDimensionScore(criteria, { a: 80, b: 60 })).toBe(70);
  });

  it("normalizes when criteria are missing", () => {
    const criteria = [
      { key: "a", weight: 0.6, rubric: "" },
      { key: "b", weight: 0.4, rubric: "" }
    ];
    // only `a` present → result should reflect just `a`
    expect(weightedDimensionScore(criteria, { a: 80 })).toBe(80);
  });

  it("clamps out-of-range subscores", () => {
    const criteria = [{ key: "a", weight: 1, rubric: "" }];
    expect(weightedDimensionScore(criteria, { a: 150 })).toBe(100);
    expect(weightedDimensionScore(criteria, { a: -20 })).toBe(0);
  });

  it("computes total scores within ±5 reproducibility budget", () => {
    const rubric1 = makeRubric();
    const rubric2 = makeRubric(); // same input → same output
    const s1 = computeScores({ rubric: rubric1, weights });
    const s2 = computeScores({ rubric: rubric2, weights });
    expect(s1).toEqual(s2);
    // Sanity bounds
    expect(s1.total).toBeGreaterThan(0);
    expect(s1.total).toBeLessThanOrEqual(100);
  });

  it("respects 40/30/30 dimension weights", () => {
    const rubric = {
      vendor_id: "x",
      maturity: { subscores: { production_deployments: 100, arr_estimate_usd: 100, customer_base: 100, release_cadence: 100, case_studies_public: 100 }, rationale: "" },
      integration: { subscores: { connector_count: 0, protocol_support: 0, self_hosting: 0, erp_anbindung: 0, sdk_languages: 0 }, rationale: "" },
      governance: { subscores: { eu_ai_act_readiness: 0, iso_certifications: 0, dsgvo_proof: 0, data_residency_eu: 0, audit_trail: 0, human_in_the_loop: 0 }, rationale: "" }
    };
    const s = computeScores({ rubric, weights });
    // maturity 100, others 0 → total ≈ 100 * 0.4 = 40
    expect(s.maturity).toBeCloseTo(100, 1);
    expect(s.integration).toBeCloseTo(0, 1);
    expect(s.governance).toBeCloseTo(0, 1);
    expect(s.total).toBeCloseTo(40, 1);
  });
});
