// Concurrency, budget, retry/backoff, circuit breaker.
// Loaded with defaults from providers.json (limits section); environment overrides allowed.

import pLimit from "p-limit";
import { logger } from "./logger.js";

export function makeLimits(providers, env = process.env) {
  const cfg = providers?.limits ?? {};
  return {
    maxVendorConcurrency: Number(env.SCOUT_MAX_VENDOR_CONCURRENCY ?? cfg.max_vendor_concurrency ?? 3),
    maxSearchesPerVendor: Number(env.SCOUT_MAX_SEARCHES_PER_VENDOR ?? cfg.max_searches_per_vendor ?? 4),
    maxTotalSearchesPerRun: Number(env.SCOUT_MAX_TOTAL_SEARCHES ?? cfg.max_total_searches_per_run ?? 60),
    maxBudgetUsdPerRun: Number(env.SCOUT_MAX_BUDGET_USD ?? cfg.max_budget_usd_per_run ?? 10)
  };
}

export function makeVendorLimiter(limits) {
  return pLimit(limits.maxVendorConcurrency);
}

// Budget tracker: throws BudgetExceededError once cumulative spend exceeds the cap.
export class BudgetExceededError extends Error {
  constructor(spent, cap) {
    super(`Budget exceeded: ${spent.toFixed(4)} USD > ${cap.toFixed(2)} USD`);
    this.name = "BudgetExceededError";
    this.spent = spent;
    this.cap = cap;
  }
}

export class BudgetTracker {
  constructor(capUsd) {
    this.capUsd = capUsd;
    this.spentUsd = 0;
    this.callCount = 0;
    this.tokenCount = 0;
  }
  charge({ usd = 0, tokens = 0, calls = 1 } = {}) {
    this.spentUsd += usd;
    this.tokenCount += tokens;
    this.callCount += calls;
    if (this.spentUsd > this.capUsd) {
      throw new BudgetExceededError(this.spentUsd, this.capUsd);
    }
  }
  snapshot() {
    return { spent_usd: this.spentUsd, calls: this.callCount, tokens: this.tokenCount };
  }
}

// Search counter — protects against runaway query expansion.
export class SearchCounter {
  constructor(limits) {
    this.limits = limits;
    this.totalSearches = 0;
    this.perVendor = new Map();
  }
  reserve(vendorId, n = 1) {
    const used = this.perVendor.get(vendorId) ?? 0;
    if (used + n > this.limits.maxSearchesPerVendor) {
      throw new Error(`Vendor ${vendorId} exceeds maxSearchesPerVendor`);
    }
    if (this.totalSearches + n > this.limits.maxTotalSearchesPerRun) {
      throw new Error(`Run exceeds maxTotalSearchesPerRun`);
    }
    this.perVendor.set(vendorId, used + n);
    this.totalSearches += n;
  }
}

// Exponential backoff with jitter.
export async function withBackoff(fn, { retries = 3, baseMs = 500, factor = 2, label } = {}) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt === retries || err.nonRetryable) break;
      const wait = Math.round(baseMs * Math.pow(factor, attempt) * (0.5 + Math.random()));
      logger.warn("retrying after error", { label, attempt, wait_ms: wait, err: String(err?.message ?? err) });
      await new Promise((r) => setTimeout(r, wait));
    }
  }
  throw lastError;
}

// Simple per-provider circuit breaker. Opens after N consecutive failures, half-opens after cooldown.
export class CircuitBreaker {
  constructor({ failureThreshold = 5, cooldownMs = 30_000 } = {}) {
    this.failureThreshold = failureThreshold;
    this.cooldownMs = cooldownMs;
    this.failures = 0;
    this.openedAt = null;
  }
  canCall() {
    if (this.openedAt === null) return true;
    if (Date.now() - this.openedAt > this.cooldownMs) {
      this.openedAt = null;
      this.failures = 0;
      return true;
    }
    return false;
  }
  recordSuccess() {
    this.failures = 0;
    this.openedAt = null;
  }
  recordFailure() {
    this.failures += 1;
    if (this.failures >= this.failureThreshold) this.openedAt = Date.now();
  }
}
