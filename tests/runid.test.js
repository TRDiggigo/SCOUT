import { describe, it, expect } from "vitest";
import { buildRunId, todayUtc } from "../src/util/runid.js";

describe("util/runid", () => {
  it("formats run_id with seconds and attempt", () => {
    const id = buildRunId({
      date: "2026-04-08",
      now: new Date("2026-04-08T06:07:08Z"),
      attempt: 3,
      sha: "abc1234"
    });
    expect(id).toBe("2026-04-08T060708Z-abc1234-03");
  });

  it("rejects missing date", () => {
    expect(() => buildRunId({})).toThrow();
  });

  it("todayUtc returns ISO date", () => {
    expect(todayUtc(new Date("2026-04-08T23:59:00Z"))).toBe("2026-04-08");
  });
});
