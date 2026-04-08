import { describe, it, expect } from "vitest";
import {
  BudgetTracker,
  BudgetExceededError,
  SearchCounter,
  CircuitBreaker,
  withBackoff
} from "../src/util/limits.js";

describe("util/limits", () => {
  it("BudgetTracker throws once cap exceeded", () => {
    const t = new BudgetTracker(1);
    t.charge({ usd: 0.4 });
    t.charge({ usd: 0.5 });
    expect(() => t.charge({ usd: 0.2 })).toThrow(BudgetExceededError);
  });

  it("SearchCounter enforces per-vendor and total caps", () => {
    const counter = new SearchCounter({ maxSearchesPerVendor: 2, maxTotalSearchesPerRun: 3 });
    counter.reserve("v1", 2);
    counter.reserve("v2", 1);
    expect(() => counter.reserve("v2", 1)).toThrow();
    expect(() => counter.reserve("v3", 1)).toThrow();
  });

  it("CircuitBreaker opens after N failures and re-closes after cooldown", async () => {
    const cb = new CircuitBreaker({ failureThreshold: 2, cooldownMs: 10 });
    expect(cb.canCall()).toBe(true);
    cb.recordFailure();
    cb.recordFailure();
    expect(cb.canCall()).toBe(false);
    await new Promise((r) => setTimeout(r, 15));
    expect(cb.canCall()).toBe(true);
  });

  it("withBackoff retries failing functions", async () => {
    let attempts = 0;
    const result = await withBackoff(
      async () => {
        attempts++;
        if (attempts < 2) throw new Error("transient");
        return "ok";
      },
      { retries: 3, baseMs: 1, label: "test" }
    );
    expect(result).toBe("ok");
    expect(attempts).toBe(2);
  });

  it("withBackoff respects nonRetryable flag", async () => {
    let attempts = 0;
    await expect(
      withBackoff(
        async () => {
          attempts++;
          const err = new Error("nope");
          err.nonRetryable = true;
          throw err;
        },
        { retries: 3, baseMs: 1 }
      )
    ).rejects.toThrow("nope");
    expect(attempts).toBe(1);
  });
});
