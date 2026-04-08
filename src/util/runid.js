// run_id = `${date}T${HHMMSS}Z-${shortSha}-${attempt}`
// Seconds + attempt suffix prevent collisions on rapid re-runs.

import { execSync } from "node:child_process";

function shortSha() {
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA.slice(0, 7);
  if (process.env.SCOUT_GIT_SHA) return process.env.SCOUT_GIT_SHA.slice(0, 7);
  try {
    return execSync("git rev-parse --short HEAD", { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
  } catch {
    return "nogit00";
  }
}

export function buildRunId({ date, now = new Date(), attempt = 1, sha } = {}) {
  if (!date) throw new Error("buildRunId requires a date (YYYY-MM-DD)");
  const hh = String(now.getUTCHours()).padStart(2, "0");
  const mm = String(now.getUTCMinutes()).padStart(2, "0");
  const ss = String(now.getUTCSeconds()).padStart(2, "0");
  const attemptStr = String(attempt).padStart(2, "0");
  return `${date}T${hh}${mm}${ss}Z-${sha ?? shortSha()}-${attemptStr}`;
}

export function todayUtc(now = new Date()) {
  return now.toISOString().slice(0, 10);
}
