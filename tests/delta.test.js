import { describe, it, expect } from "vitest";
import { runDelta } from "../src/tasks/a4-delta.js";
import { loadConfigFixtures, makeScoresFile } from "./fixtures.js";

const { weights } = loadConfigFixtures();

function fakeFiles(prevScoresFile, prevManifest = null) {
  return {
    async readJson(path) {
      if (path.endsWith("/latest/scores.json")) return prevScoresFile;
      if (path.endsWith("latest.manifest.json")) return prevManifest;
      return null;
    }
  };
}

describe("a4-delta", () => {
  it("emits no events when scores are unchanged", async () => {
    const prev = makeScoresFile("prev-run", [
      { vendor_id: "v1", scores: { maturity: 70, integration: 60, governance: 80, total: 70 } }
    ]);
    const curr = makeScoresFile("run-1", [
      { vendor_id: "v1", scores: { maturity: 70, integration: 60, governance: 80, total: 70 } }
    ]);
    const delta = await runDelta({ scoresFile: curr, files: fakeFiles(prev), weights, date: "2026-04-08" });
    expect(delta.events).toHaveLength(0);
  });

  it("emits info event for ≥5 point change", async () => {
    const prev = makeScoresFile("prev-run", [
      { vendor_id: "v1", scores: { maturity: 70, integration: 60, governance: 80, total: 70 } }
    ]);
    const curr = makeScoresFile("run-1", [
      { vendor_id: "v1", scores: { maturity: 76, integration: 60, governance: 80, total: 72.4 } }
    ]);
    const delta = await runDelta({ scoresFile: curr, files: fakeFiles(prev), weights, date: "2026-04-08" });
    const matEvent = delta.events.find((e) => e.dimension === "maturity");
    expect(matEvent).toBeDefined();
    expect(matEvent.severity).toBe("info");
    expect(matEvent.delta).toBeCloseTo(6, 1);
  });

  it("escalates to warning at ≥10 point change", async () => {
    const prev = makeScoresFile("prev-run", [
      { vendor_id: "v1", scores: { maturity: 70, integration: 60, governance: 80, total: 70 } }
    ]);
    const curr = makeScoresFile("run-1", [
      { vendor_id: "v1", scores: { maturity: 85, integration: 60, governance: 80, total: 76 } }
    ]);
    const delta = await runDelta({ scoresFile: curr, files: fakeFiles(prev), weights, date: "2026-04-08" });
    const matEvent = delta.events.find((e) => e.dimension === "maturity");
    expect(matEvent.severity).toBe("warning");
  });

  it("flags new vendors and disappeared vendors", async () => {
    const prev = makeScoresFile("prev-run", [{ vendor_id: "old" }]);
    const curr = makeScoresFile("run-1", [{ vendor_id: "fresh" }]);
    const delta = await runDelta({ scoresFile: curr, files: fakeFiles(prev), weights, date: "2026-04-08" });
    expect(delta.events.find((e) => e.type === "new_vendor_in_scores")).toBeDefined();
    expect(delta.events.find((e) => e.type === "vendor_disappeared")).toBeDefined();
  });

  it("handles missing previous snapshot gracefully", async () => {
    const curr = makeScoresFile("run-1", [{ vendor_id: "v1" }]);
    const delta = await runDelta({ scoresFile: curr, files: fakeFiles(null), weights, date: "2026-04-08" });
    expect(delta.events.find((e) => e.type === "new_vendor_in_scores")).toBeDefined();
  });
});
