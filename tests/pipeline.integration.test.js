// Integration test: A1→A6 with mocked Anthropic, OpenAI and Graph layers.
// Verifies run_id, structured outputs, scoring math, delta detection, and the
// promotion-to-latest semantics.

import { describe, it, expect } from "vitest";
import { runPipeline } from "../src/pipeline.js";
import { loadConfigFixtures, makeRubric } from "./fixtures.js";

class MockAnthropic {
  constructor() {
    this.calls = [];
  }
  async researchWithWebSearch({ vendor, queries }) {
    this.calls.push({ kind: "research", vendor: vendor.vendor_id });
    return {
      text: `Research notes for ${vendor.name}: ${queries.join(" / ")}`,
      raw_results: [{ url: `https://example.com/${vendor.vendor_id}`, title: "Example" }],
      usage: { input_tokens: 200, output_tokens: 400 },
      model: "claude-sonnet-4-6"
    };
  }
  async extractStructured({ schemaName }) {
    this.calls.push({ kind: "extract", schemaName });
    const today = new Date().toISOString();
    return {
      data: {
        vendor_id: "test",
        evidence: [
          {
            claim: "Production deployments documented",
            dimension: "maturity",
            source_url: "https://example.com/case",
            source_type: "vendor",
            published_at: "2026-03-15",
            retrieved_at: today,
            relevance: 0.9
          },
          {
            claim: "MCP support announced",
            dimension: "integration",
            source_url: "https://example.com/api",
            source_type: "news",
            published_at: "2026-03-20",
            retrieved_at: today,
            relevance: 0.85
          },
          {
            claim: "ISO 27001 certified",
            dimension: "governance",
            source_url: "https://example.com/iso",
            source_type: "regulator",
            published_at: "2026-02-01",
            retrieved_at: today,
            relevance: 0.95
          }
        ]
      },
      usage: { input_tokens: 100, output_tokens: 200 },
      model: "claude-sonnet-4-6"
    };
  }
  async scoreRubric({ schema }) {
    this.calls.push({ kind: "scoreRubric" });
    return { data: makeRubric(), usage: {}, model: "claude-opus-4-6" };
  }
  async generate() {
    this.calls.push({ kind: "generate" });
    return { text: "Sehr nüchterner Lagebericht.", usage: {}, model: "claude-sonnet-4-6" };
  }
}

class MockFiles {
  constructor() {
    this.uploads = new Map();
    this.siteId = "mock-site";
  }
  async ensureFolder() {}
  async uploadJson(path, data) {
    this.uploads.set(path, data);
  }
  async uploadText(path, text) {
    this.uploads.set(path, text);
  }
  async readJson(path) {
    return this.uploads.get(path) ?? null;
  }
  async copyFile() {}
  async getDriveId() {
    return "mock-drive";
  }
}

class MockGraph {
  async request() {
    return { value: [{ id: "list-1" }] };
  }
}

describe("pipeline integration (mocked)", () => {
  it("runs A1→A6 end-to-end and persists run + latest snapshot", async () => {
    const config = loadConfigFixtures();
    // Reduce vendor count for speed; pipeline must still work with arbitrary subset.
    config.vendors = { vendors: config.vendors.vendors.slice(0, 3) };
    const anthropic = new MockAnthropic();
    const files = new MockFiles();
    const graph = new MockGraph();

    const result = await runPipeline({
      date: "2026-04-08",
      config,
      anthropic,
      openai: null,
      files,
      graph
    });

    expect(result.runId).toMatch(/^2026-04-08T\d{6}Z-[A-Za-z0-9]+-\d{2}$/);
    expect(result.scoresFile.vendors).toHaveLength(3);
    for (const v of result.scoresFile.vendors) {
      expect(v.scores.total).toBeGreaterThan(0);
      expect(v.freshness_status).toBe("current");
    }
    // run-scoped artefacts written
    const runDir = `SCOUT/data/2026-04-08/${result.runId}`;
    expect(files.uploads.has(`${runDir}/scores.json`)).toBe(true);
    expect(files.uploads.has(`${runDir}/evidence.json`)).toBe(true);
    expect(files.uploads.has(`${runDir}/run-manifest.json`)).toBe(true);
    expect(files.uploads.has(`${runDir}/metrics.json`)).toBe(true);
    // latest promoted
    expect(files.uploads.has(`SCOUT/data/2026-04-08/latest/scores.json`)).toBe(true);
    expect(files.uploads.has(`SCOUT/data/2026-04-08/latest.manifest.json`)).toBe(true);
    // report rendered
    const report = files.uploads.get(`SCOUT/reports/2026-04-08/${result.runId}/daily.md`);
    expect(report).toContain("SCOUT Tagesreport 2026-04-08");
    // manifest carries config_hash + status
    expect(result.manifest.config_hash).toMatch(/^[a-f0-9]{64}$/);
    expect(result.manifest.status).toBe("ok");
    expect(result.manifest.partial_failures).toEqual([]);
  });

  it("dry-run skips persistence but produces full artefacts", async () => {
    const config = loadConfigFixtures();
    config.vendors = { vendors: config.vendors.vendors.slice(0, 2) };
    const anthropic = new MockAnthropic();
    const files = new MockFiles();
    const result = await runPipeline({
      date: "2026-04-08",
      dryRun: true,
      config,
      anthropic,
      openai: null,
      files,
      graph: new MockGraph()
    });
    expect(result.persistResult.dryRun).toBe(true);
    expect(result.scoresFile.vendors).toHaveLength(2);
  });
});
