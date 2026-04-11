import { describe, it, expect } from "vitest";
import { hashJson, configHash } from "../src/util/audit.js";

describe("util/audit", () => {
  it("hashes equal JSON to equal digest regardless of key order", () => {
    expect(hashJson({ a: 1, b: 2 })).toBe(hashJson({ b: 2, a: 1 }));
  });

  it("config_hash is stable for the same config", () => {
    const cfg = { vendors: { v: 1 }, weights: { w: 1 }, sources: { s: 1 }, providers: { p: 1 } };
    expect(configHash(cfg)).toBe(configHash(cfg));
  });

  it("config_hash changes when any input changes", () => {
    const a = { vendors: { v: 1 }, weights: {}, sources: {}, providers: {} };
    const b = { vendors: { v: 2 }, weights: {}, sources: {}, providers: {} };
    expect(configHash(a)).not.toBe(configHash(b));
  });
});
