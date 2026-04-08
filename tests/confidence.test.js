import { describe, it, expect } from "vitest";
import {
  computeConfidence,
  needsSecondOpinion,
  maxDimensionDeviation
} from "../src/scoring/confidence.js";
import { makeRubric, makeEvidence } from "./fixtures.js";

describe("scoring/confidence", () => {
  it("returns high confidence for well-distributed evidence + complete rubric", () => {
    const evidence = makeEvidence({ count: 12 });
    const rubric = makeRubric();
    const { confidence } = computeConfidence({
      vendorEvidence: evidence,
      rubric,
      now: new Date("2026-04-08")
    });
    expect(confidence).toBeGreaterThan(0.7);
  });

  it("flags missing dimensions and zero-evidence dimensions in reasons", () => {
    const evidence = { vendor_id: "x", evidence: [] };
    const rubric = makeRubric();
    const { confidence, reasons } = computeConfidence({ vendorEvidence: evidence, rubric });
    expect(confidence).toBeLessThan(0.5);
    expect(reasons.some((r) => r.includes("zero evidence"))).toBe(true);
  });

  it("penalizes single source_type diversity", () => {
    const today = new Date().toISOString();
    const evidence = {
      vendor_id: "x",
      evidence: Array.from({ length: 6 }, (_, i) => ({
        claim: `c${i}`,
        dimension: ["maturity", "integration", "governance"][i % 3],
        source_url: `https://example.com/${i}`,
        source_type: "vendor",
        published_at: "2026-04-01",
        retrieved_at: today,
        relevance: 0.8
      }))
    };
    const rubric = makeRubric();
    const { confidence, reasons } = computeConfidence({ vendorEvidence: evidence, rubric });
    expect(reasons.some((r) => r.includes("source diversity"))).toBe(true);
    expect(confidence).toBeLessThan(0.85);
  });

  it("triggers second-opinion gate below threshold", () => {
    expect(needsSecondOpinion(0.5, 0.7)).toBe(true);
    expect(needsSecondOpinion(0.71, 0.7)).toBe(false);
  });

  it("computes max dimension deviation between two rubrics", () => {
    const a = makeRubric();
    const b = makeRubric();
    // shift one subscore in maturity by 50 points
    b.maturity.subscores.production_deployments = 30;
    const dev = maxDimensionDeviation(a, b);
    expect(dev).toBeGreaterThan(5);
  });

  it("penalises stale evidence (median age > 1 year)", () => {
    const today = new Date("2026-04-08");
    const evidence = {
      vendor_id: "x",
      evidence: Array.from({ length: 6 }, (_, i) => ({
        claim: `c${i}`,
        dimension: ["maturity", "integration", "governance"][i % 3],
        source_url: `https://example.com/${i}`,
        source_type: ["vendor", "news", "analyst"][i % 3],
        published_at: "2024-01-01",
        retrieved_at: today.toISOString(),
        relevance: 0.8
      }))
    };
    const rubric = makeRubric();
    const { confidence, reasons } = computeConfidence({ vendorEvidence: evidence, rubric, now: today });
    expect(reasons.some((r) => r.includes("median evidence age"))).toBe(true);
    expect(confidence).toBeLessThan(0.7);
  });
});
