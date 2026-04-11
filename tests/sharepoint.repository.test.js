import { describe, it, expect } from "vitest";
import { ScoresListRepository } from "../src/sharepoint/repository.js";

class FakeGraph {
  constructor() {
    this.calls = [];
    this.itemsByVendor = new Map();
    this.nextId = 1;
    this.etagCounter = 0;
  }
  async request(method, path, opts = {}) {
    this.calls.push({ method, path, opts });
    if (method === "GET" && path.includes("/lists?")) {
      return { value: [{ id: "list-1", displayName: "SCOUT-Scores" }] };
    }
    if (method === "GET" && path.includes("/items?")) {
      const m = path.match(/vendor_id eq '([^']+)'/);
      const vendorId = m?.[1];
      const item = this.itemsByVendor.get(vendorId);
      return { value: item ? [item] : [] };
    }
    if (method === "POST" && path.endsWith("/items")) {
      const id = String(this.nextId++);
      const item = { id, "@odata.etag": `"e${++this.etagCounter}"`, fields: opts.body.fields };
      this.itemsByVendor.set(opts.body.fields.vendor_id, item);
      return item;
    }
    if (method === "PATCH" && path.includes("/fields")) {
      const idMatch = path.match(/items\/(\d+)\/fields/);
      const id = idMatch?.[1];
      for (const [vendorId, item] of this.itemsByVendor.entries()) {
        if (item.id === id) {
          this.itemsByVendor.set(vendorId, {
            ...item,
            "@odata.etag": `"e${++this.etagCounter}"`,
            fields: { ...item.fields, ...opts.body }
          });
          return this.itemsByVendor.get(vendorId);
        }
      }
    }
    return null;
  }
}

describe("sharepoint repository upsert", () => {
  it("creates a new item when vendor_id is unknown", async () => {
    const graph = new FakeGraph();
    const repo = new ScoresListRepository(graph, "site-1", "SCOUT-Scores");
    await repo.upsertScoreItem("vendor-a", { title: "Vendor A", total_score: 80 });
    const created = graph.itemsByVendor.get("vendor-a");
    expect(created).toBeDefined();
    expect(created.fields.total_score).toBe(80);
  });

  it("patches an existing item with if-match header", async () => {
    const graph = new FakeGraph();
    const repo = new ScoresListRepository(graph, "site-1", "SCOUT-Scores");
    await repo.upsertScoreItem("vendor-a", { title: "Vendor A", total_score: 80 });
    await repo.upsertScoreItem("vendor-a", { title: "Vendor A", total_score: 85 });
    const patchCall = graph.calls.find((c) => c.method === "PATCH");
    expect(patchCall).toBeDefined();
    expect(patchCall.opts.headers["If-Match"]).toBeTruthy();
    expect(graph.itemsByVendor.get("vendor-a").fields.total_score).toBe(85);
  });
});
